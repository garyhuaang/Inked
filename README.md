# Inked

A searchable directory of tattoo artists in Dallas and Austin — who they are,
where they work, and what they do. Browse by map: the viewport is the query.

Next.js (App Router) · Tailwind · shadcn/ui · Redux Toolkit · Prisma · Neon
Postgres · MapLibre with OpenFreeMap tiles.

## Live Deployment - Vercel
- https://garyhuaang.github.io/sas-mrts/](https://inked-five.vercel.app/

## Local setup

```bash
npm install                 # postinstall runs `prisma generate`
cp .env.example .env        # fill in both Neon connection strings
npx prisma migrate dev      # create the schema
npx prisma db seed          # load placeholder Dallas/Austin data
npm run dev
```

`.env` needs two URLs from the Neon dashboard, and they are not
interchangeable:

| Variable | Which Neon URL | Used by |
|---|---|---|
| `DATABASE_URL` | pooled — host contains `-pooler` | the app at runtime |
| `DIRECT_URL` | direct — no `-pooler` | Prisma CLI, migrations |

Migrations run DDL, which fails through Neon's connection pooler. The app wants
the pooler, because serverless functions open many short-lived connections.

## Deploying

Vercel auto-detects Next.js. Set **both** environment variables above for
Production, Preview, and Development before the first build — `src/lib/db.ts`
throws at module load if `DATABASE_URL` is missing, so a build without them
fails rather than degrading.

`npm run build` runs `prisma migrate deploy` first, so pushing a migration
applies it to the database as part of the deploy.

## Layout

```
prisma/            schema, migrations, seed
src/app/           routes; api/shops is the bounding-box query
src/components/    Directory, MapView, ShopList, common (shadcn)
src/lib/store/     Redux Toolkit — ui slice + RTK Query
src/lib/db.ts      PrismaClient + Neon driver adapter
```

## Data

Everything currently in the database is invented placeholder data at
real-ish coordinates. Nothing is scraped, and no row describes a real business
or person. See `Tattoo-Directory-Spec.md` for the sourcing rules the real
dataset has to follow.
