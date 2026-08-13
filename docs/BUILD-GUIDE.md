# Build guide: Next.js + Prisma + Neon on Vercel

How Inked went from an empty folder to a live URL, why each choice was made, and
what went wrong along the way.

Written as a manual for someone doing the same thing. Every command here was
actually run; every failure described actually happened. Versions are pinned to
what was current on **10 Aug 2026** — check for newer ones, because three of the
day's problems came from tooling that changed recently.

**Target:** a stranger can load your domain, and pushing to `main` deploys
automatically.

**Result:** <https://inked-five.vercel.app> — verified from outside the build
machine (HTTP 200, API returning rows from Postgres).

---

## Table of contents

1. [What you need first](#1-what-you-need-first)
2. [Scaffold the app](#2-scaffold-the-app)
3. [Add the UI layer](#3-add-the-ui-layer)
4. [Add the map](#4-add-the-map)
5. [Add state management](#5-add-state-management)
6. [Add the database](#6-add-the-database)
7. [Seed it and read from it](#7-seed-it-and-read-from-it)
8. [Deploy](#8-deploy)
9. [Everything that went wrong](#9-everything-that-went-wrong)
10. [Concepts you need to actually understand](#10-concepts-you-need-to-actually-understand)
11. [Honest state of the code](#11-honest-state-of-the-code)

---

## 1. What you need first

| Thing            | Why                                                          |
| ---------------- | ------------------------------------------------------------ |
| Node 20+         | Next 16 requires it                                          |
| A GitHub repo    | Vercel deploys from it; this is what makes deploys automatic |
| A Neon account   | Free Postgres, no credit card                                |
| A Vercel account | Free hosting, auto-detects Next.js                           |

**Decide your branch and PR workflow before you start.** This project used one
branch per unit of work (`INK-0`, `INK-1`, …), each merged via a PR on GitHub.
That is worth doing even solo: it forces each change to be small enough to
explain, and it gives you a place to write down _why_.

---

## 2. Scaffold the app

```bash
npx create-next-app@latest my-app \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --empty --disable-git
```

**Why these flags:**

- `--app` — App Router, not the older Pages Router. Server Components live here.
- `--src-dir` — keeps app code in `src/` instead of the repo root. Cosmetic, but
  it keeps config files and code visually separate.
- `--import-alias "@/*"` — lets you write `@/lib/db` instead of
  `../../../lib/db`. **shadcn/ui requires this alias**, so set it now.
- `--empty` — skips the demo landing page you would delete anyway.
- `--disable-git` — only because this repo already existed. Omit it normally.

> **Gotcha: npm package names cannot contain capital letters.** Our folder was
> `Inked`, so `create-next-app .` refused to run. The fix was to scaffold into a
> lowercase temp directory, move the files in, and set `"name": "inked"` in
> `package.json` by hand.

### Verify before moving on

```bash
npm run dev     # http://localhost:3000 should load
```

Do this after **every** step below. Debugging one new thing is easy; debugging
five at once is not. Most of the time lost today came from stacking changes
before checking them.

---

## 3. Add the UI layer

```bash
npx shadcn@latest init -y -b radix -p nova
npx shadcn@latest add button card badge input skeleton
```

**What shadcn/ui is, and why it is not a dependency.** Most component libraries
are packages you import from. shadcn _copies source files into your repo_. You
own them, and you edit them directly. The tradeoff: no automatic upgrades, but
no fighting a library's opinions either.

**Flag notes:**

- `-b radix` — the underlying primitives. Radix is the classic shadcn base.
- `-p nova` — a preset (Lucide icons + Geist font). Without `-p`, the CLI
  **prompts interactively and hangs** in a non-interactive shell.
- Do **not** use `-d`. It means "defaults", and its default is
  `--template=next`, which scaffolds a _brand new project_ on top of yours.

### `components.json` decides where files land

```jsonc
"aliases": { "ui": "@/components/common" }
```

If you reorganise later — we moved `components/ui/` to `components/common/` —
**update this file too**. Otherwise the next `shadcn add` silently recreates the
old folder and drops the component there.

---

## 4. Add the map

```bash
npm install maplibre-gl
```

**MapLibre + OpenFreeMap over Google Maps.** Reasons, in order:

1. **No API key, no billing account.** Google Maps requires a credit card even
   on the free tier. OpenFreeMap (`https://tiles.openfreemap.org/styles/positron`)
   serves vector tiles with no key at all.
2. **Clustering is built in.** MapLibre's GeoJSON source takes `cluster: true`.
   Google needs a separate MarkerClusterer library.
3. **The map style is JSON**, so it can be themed to match your design tokens.

MapLibre is the _renderer_; something else must serve the _tiles_. OpenFreeMap
is the tile provider. They are separate concerns.

### Three things that will bite you in Next.js

**`maplibre-gl` touches `window` when imported.** A Client Component still gets
evaluated on the server during SSR, so a top-level `import` crashes the build.
Import it dynamically, inside the effect:

```ts
const maplibregl = await import('maplibre-gl');
```

**The container is often 0px tall when your effect runs**, because CSS has not
applied yet. MapLibre reads the container size at construction; if it is zero,
the canvas is unsized and **the map never requests a single tile**. Symptom: a
blank map, no errors, no network activity. Fix:

```ts
const observer = new ResizeObserver(() => {
  map.resize();
});
observer.observe(container);
```

**Use `style.load`, not `load`, to add sources and layers.** `load` waits for a
_first visually complete render_, which never happens if the canvas started
unsized — so your setup code never runs. `style.load` fires when the style is
parsed, which is all you need.

---

## 5. Add state management

```bash
npm install @reduxjs/toolkit react-redux
```

**Was Redux necessary?** Honestly, no — not for this app's size. It was a
deliberate choice to practise a pattern used at work. What it _did_ earn:
RTK Query deleted a meaningful amount of hand-written code (see below).

### The store must be a factory, not a singleton

Most Redux tutorials show:

```ts
export const store = configureStore({ ... })   // ❌ wrong for SSR
```

On a server this module is evaluated **once per process**, not once per user.
Every visitor would share one store — including one user's cached API data
appearing in another's page. Instead:

```ts
export const makeStore = () => configureStore({ ... })   // ✅
```

and create it once per client in a Provider component.

### Use `useState`, not `useRef`, for the store instance

Redux's own Next.js docs show `useRef`. Modern React lint rules reject reading
`ref.current` during render, and it flagged this immediately:

```ts
const [store] = useState(makeStore); // lazy initializer: runs once
```

Same guarantee, render-safe.

### RTK Query is the part that pays for itself

Before, `Directory.tsx` hand-rolled all of this:

- an `AbortController` to cancel in-flight requests when the map moved
- a monotonically increasing request ID, so a slow early response could not
  overwrite a fast later one
- four `useState` calls for data, loading, error, truncated

After, it is one line:

```ts
const { data, isFetching, isError } = useGetShopsQuery(bounds ?? skipToken);
```

`skipToken` means "no bounds yet, do not fire a request". The component went
from 95 lines to 44.

### File layout

Modelled on an existing project so conventions match across repos:

```
src/lib/store/
├── index.ts              barrel
├── store.ts              rootReducer + configureStore + typed hooks
├── features/ui.slice.ts  bounds + selectedSlug
└── api/api.slice.ts      createApi + useGetShopsQuery
```

Slices are kept private and export a named reducer (`export const uiReducer =
uiSlice.reducer`) plus named actions. Typed hooks (`useAppSelector`,
`useAppDispatch`) live beside the store so no component ever re-declares
`RootState`.

---

## 6. Add the database

```bash
npm install --save-dev prisma dotenv
npm install @prisma/client
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

> **Prisma 7 is meaningfully different from Prisma 5/6.** Most tutorials and
> most search results still describe the old API. Three breaking changes bit us
> in a row.

### Change 1 — `prisma init` scaffolds AI-agent files

It creates `.agents/`, `.windsurf/`, `.claude/skills/` and `skills-lock.json`.
Unless you use those tools, delete them; they are noise in a diff.

### Change 2 — the connection URL moved out of `schema.prisma`

It now lives in `prisma.config.ts`. And critically, that config's datasource
type has only `url` and `shadowDatabaseUrl` — **there is no `directUrl` field**,
which older Prisma+Neon guides tell you to use.

### Change 3 — a driver adapter is now required

`new PrismaClient({ datasourceUrl })` no longer typechecks. Prisma 7 requires an
adapter:

```bash
npm install @prisma/adapter-neon @neondatabase/serverless
```

```ts
new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
```

### Neon gives you TWO connection strings and they are not interchangeable

This is the single most important thing in this document.

| Variable       | Neon URL                           | Used by                 | Why                                                                                        |
| -------------- | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL` | **pooled** (`-pooler` in the host) | the app at runtime      | Serverless functions open many short-lived connections; the pooler exists for exactly that |
| `DIRECT_URL`   | **direct** (no `-pooler`)          | Prisma CLI / migrations | Migrations run DDL, which fails through the pooler                                         |

Since Prisma 7 has no `directUrl` field, the split is expressed by pointing the
_config_ at the direct URL:

```ts
// prisma.config.ts — used by the CLI only
datasource: {
  url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'];
}
```

while the runtime client reads `DATABASE_URL`. One hyphen is the whole
difference. Swapping them fails in confusing ways.

### The schema, and the decisions inside it

Two indexes were added deliberately, not by habit:

```prisma
@@index([lat, lng])    // on Shop — serves the bounding-box query
@@index([name, id])    // on Artist — the pagination tiebreaker
```

The second needs explaining. If you paginate by name alone and two artists share
a name, the row at a page boundary gets **silently skipped** — it exists in the
database but is unreachable through the API. Adding `id` as a tiebreaker makes
the sort key unique. (The index is in place; cursor pagination itself is not
implemented yet.)

`ArtistShop` is an **explicit** join table rather than an implicit many-to-many,
because the relationship carries data (`isPrimary`, `isGuest`). Artists move
between shops and guest-spot; a `shopId` column on `Artist` would have been
wrong within a month.

`users` and `claims` were deliberately **left out**. They need authentication,
which is a later milestone. Do not model tables you are not about to use.

### Run it

```bash
cp .env.example .env      # paste both Neon URLs
npx prisma migrate dev --name init
```

**Gitignore care:** `.gitignore` has `.env*`, which also ignores `.env.example`.
Add an exception, or nobody can see what variables they need:

```gitignore
.env*
!.env.example
```

The generated client is gitignored too, so CI must regenerate it:

```json
"postinstall": "prisma generate"
```

### Verify independently

Do not trust the CLI's success message alone. Query Postgres directly with a
different tool and confirm the tables really exist:

```
tables : _prisma_migrations, artist_shops, artist_styles, artists, shops, styles
indexes: artists_name_id_idx, shops_lat_lng_idx
City   : dallas, austin
```

---

## 7. Seed it and read from it

```bash
npm install --save-dev tsx
```

`tsx` runs TypeScript directly. Wire it up in `prisma.config.ts`:

```ts
migrations: {
  seed: 'tsx prisma/seed.ts';
}
```

**Gotcha: top-level `await` fails.** Without `"type": "module"` in
`package.json`, tsx compiles to CommonJS, which does not support it. Use a
`.then()/.catch()` chain instead.

### Make the seed idempotent

Every row is `upsert`ed on its unique `slug`, so re-running updates rather than
duplicating. Join rows are deleted and recreated wholesale — the seed is their
only writer, so that stays correct and is easier to reason about than diffing.

### Seed data should not share types with your API

The placeholder data started in `src/lib/sample-data.ts`, typed as the API's
`Artist`. Moving it to `prisma/seed-data.ts` broke the types, and that break was
informative: **what goes into the database is keyed by slug; what comes out is
keyed by id and shaped for the UI.** They are different things and now have
different types (`SeedArtist` vs `Artist`).

### The bounding-box query

```ts
where: {
  lat: { gte: bounds[0], lte: bounds[2] },
  lng: { gte: bounds[1], lte: bounds[3] },
}
```

That is all a viewport query is — two `BETWEEN`s, served by the `lat, lng` index.
**You do not need PostGIS** for rectangles. PostGIS earns its keep for distance
("within 5km of me") and irregular shapes.

Two smaller decisions:

- `take: limit + 1` — if the extra row comes back, there were more results, so
  `truncated: true` costs no second `COUNT` query.
- `orderBy: [{ name: 'asc' }, { id: 'asc' }]` — stable ordering, same
  tiebreaker reasoning as the index.

Style labels ("Fine line") now come from the `styles` table, which deleted a
hardcoded `STYLE_LABELS` map from the UI. One less thing to keep in sync.

---

## 8. Deploy

### Make deploys apply migrations

```json
"build": "prisma migrate deploy && next build"
```

Without this, pushing a schema change deploys code your database cannot serve.
`migrate deploy` (unlike `migrate dev`) only applies existing migrations and
never generates or resets — it is the safe one for CI.

### On Vercel

1. Import the GitHub repo. Next.js is auto-detected; do not override the build
   command, it comes from `package.json`.
2. **Add both environment variables before the first deploy.** `src/lib/db.ts`
   throws at module load if `DATABASE_URL` is missing, so the build _fails_
   rather than degrading.
3. Tick **Production and Preview** (and Development if you use `vercel dev`).
   Production-only means every preview deploy fails.

### Verify from outside

Do not just look at the green checkmark. Hit the deployed API and confirm real
rows come back:

```bash
curl -s "https://your-app.vercel.app/api/shops?bounds=32.6,-97.0,32.9,-96.6"
```

Data that could only have come from the database — for us, style names stored in
the `styles` table — is what proves the whole chain works, rather than a
rendered shell over a broken backend.

---

## 9. Everything that went wrong

The useful part of this document.

### The first deploy failed on placeholder credentials

```
Error: P1001: Can't reach database server at `ep-xxx.REGION.aws.neon.tech:5432`
```

`ep-xxx.REGION` is the literal dummy text from `.env.example` — the example file
had been pasted into Vercel instead of the real `.env`.

**Diagnosing it without seeing the secret:** the masked value fields were 84 and
77 characters, exactly the lengths of the two example strings (differing by the
7 characters of `-pooler`). **Lesson:** make placeholders obviously fake
(`<PASTE_POOLED_URL_HERE>`), not realistic-looking.

### `Badge` imported from the wrong package

```ts
import { Badge } from 'lucide-react'; // ❌ an SVG icon
import { Badge } from '@/components/common/badge'; // ✅ the component
```

Lucide exports a `Badge` _icon_, so the import resolves and looks plausible.
Icons ignore `children`, so every label would have rendered as an empty glyph.
**Lesson:** when an import "exists" but the props are rejected, check _which
package_ you imported from.

### Two real map bugs, found by measuring rather than guessing

Both produced the same symptom — a blank map with no errors:

1. **Container 0px tall at construction** → canvas unsized → zero tile requests.
   Fixed with `ResizeObserver`.
2. **`setData` never called.** The code did
   `if (map.isStyleLoaded()) apply() else map.once('style.load', apply)`.
   `style.load` had _already fired_, so the `once` never ran again — but
   `isStyleLoaded()` returns false until **every source** has loaded, so the
   first branch failed too. Neither ran; the map had zero features. Fixed with
   an explicit `readyRef` flag set inside the `style.load` handler.

**Lesson:** for "nothing renders and nothing errors", inspect live object state
(`map.getSource(...)`, `queryRenderedFeatures()`, canvas dimensions) rather than
re-reading the code. The second bug was invisible by inspection and obvious the
moment the source reported 0 features.

### Still unresolved: the map does not paint

Established facts:

- canvas sizes correctly (1016×831), zoom and bounds are correct
- the GeoJSON source holds all 9 shop features
- all layers exist (`clusters`, `cluster-count`, `shop-pins`)
- **no errors are emitted** by MapLibre, the console, or the network
- `map.loaded()`, `isStyleLoaded()`, `isSourceLoaded('shops')` stay `false`
  after 60 seconds, and `queryRenderedFeatures()` returns 0

It reproduces on the deployed Vercel site, which rules out the local
environment, but **every observation so far comes from headless Chromium**. The
next step is one minute of work: open the site in a normal browser. If it draws,
this is a headless artifact. If not, it is real and the state above is the
starting point.

---

## 10. Concepts you need to actually understand

Short explanations of things this project uses that are easy to cargo-cult.

**Server vs Client Components.** In the App Router everything is a Server
Component by default — it runs on the server and ships no JavaScript. `'use
client'` marks a boundary: that file _and everything it imports_ goes to the
browser. You need it for state, effects, and event handlers. A Client Component
is still server-_rendered_ once for the initial HTML, which is why
`maplibre-gl`'s `window` access breaks at import time.

**Why the store is a factory.** See §5. On the server, module scope is shared
across all requests.

**Pooled vs direct connections.** See §6. Pooler for the app, direct for
migrations.

**What a driver adapter is.** Prisma used to ship a native binary that talked to
Postgres. Prisma 7 delegates to a JavaScript driver — here Neon's serverless
driver, which uses HTTP/WebSockets instead of raw TCP and so suits short-lived
serverless functions.

**What a barrel file is.** An `index.ts` that re-exports a folder's public
surface, so consumers write `@/components/MapView` instead of reaching into
`@/components/MapView/MapView`. The point is that a folder can reorganise
internally without breaking importers — which only works if nobody bypasses it.

**Why `.types.ts` files.** Each component's props type lives beside it. Whether
this is worth it is a matter of taste; the value is consistency, so a reader
always knows where to look.

**What `skipToken` does.** Tells RTK Query "not yet" — no request fires until
the argument is non-null. Cleaner than a conditional hook, which React forbids.

---

## 11. Honest state of the code

Things a reviewer would legitimately flag.

### Inconsistent formatting

Files disagree on quotes and semicolons — `Directory.tsx` uses double quotes and
semicolons, `MapView.tsx` uses single and none. Prettier was applied to some
files and not others.

**Fix:** add Prettier with a committed config, run it across the repo once, and
add a `format:check` step. Do this _first_ — it makes every later diff readable.

### `MapView.tsx` is 211 lines and does too much

It initialises the map, defines layers, wires six event handlers, debounces the
viewport, and syncs selection. Layer definitions and event wiring could be
extracted into helpers.

### Mixed export styles

`ArtistDetails` uses `export default`; everything else uses named exports. Pick
one.

### No tests

Nothing verifies the bounding-box filter, the truncation flag, or the seed's
idempotence. The API route is the highest-value place to start — it is pure
input/output.

### Known gaps, deliberately deferred

- **No cursor pagination.** The `(name, id)` index exists; the `?cursor=` param
  does not.
- **RTK Query caches on raw float bounds**, so every pixel of pan is a new cache
  key and a fresh request. Quantising bounds (rounding, or snapping to a grid)
  would make the cache actually hit.
- **All data is invented placeholder data.** Real curation has not started.
- **No `users`/`claims` tables**, no auth, no claim flow.

### If you refactor, in this order

1. **Prettier + one formatting pass.** Cheapest, and makes everything else
   reviewable.
2. **Resolve the map bug** — check it in a real browser first.
3. **Tests for `/api/shops`.** Locks in behaviour before you change it.
4. **Split `MapView.tsx`.**
5. **Then** the deferred gaps above.

Do not refactor and change behaviour in the same commit. When something breaks
you want to know which one caused it.
