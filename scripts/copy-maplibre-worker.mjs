/**
 * Copy MapLibre's worker bundle into public/ so it can be served from a
 * stable same-origin URL.
 *
 * MapLibre resolves its worker with `new URL(..., import.meta.url)`, which
 * Turbopack rewrites incorrectly: `import.meta.url` is not an http(s) URL in
 * its chunks, so the library falls back to `new Worker('')` — the page itself
 * — and the map renders no tiles. `setWorkerUrl` (called in MapView) is the
 * supported escape hatch, and these copies give it something to point at.
 * The worker imports `./maplibre-gl-shared.mjs` relatively, so both files
 * must sit side by side under the same path.
 *
 * Runs from postinstall; re-runs on every install so upgrades stay in sync.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'maplibre-gl', 'dist')
const dest = join(root, 'public', 'maplibre')

await mkdir(dest, { recursive: true })
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  await copyFile(join(src, file), join(dest, file))
}
