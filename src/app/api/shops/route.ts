import { ARTISTS, SHOPS } from '@/lib/sample-data'
import type { Bounds, ShopWithArtists, ShopsResponse } from '@/lib/types'

/**
 * GET /api/shops?bounds=swLat,swLng,neLat,neLng
 *
 * Stands in for the bounding-box query in the spec. Once Prisma lands this
 * becomes the two BETWEENs against shops.lat / shops.lng; the contract stays.
 */

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 500

function parseBounds(raw: string | null): Bounds | null {
  if (!raw) return null

  const parts = raw.split(',').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null

  const [swLat, swLng, neLat, neLng] = parts as Bounds
  // A viewport crossing the antimeridian would invert lng; out of scope for Texas.
  if (swLat > neLat || swLng > neLng) return null

  return [swLat, swLng, neLat, neLng]
}

export function GET(request: Request): Response {
  const { searchParams } = new URL(request.url)

  const rawBounds = searchParams.get('bounds')
  if (rawBounds !== null && parseBounds(rawBounds) === null) {
    return Response.json(
      { error: 'bounds must be swLat,swLng,neLat,neLng' },
      { status: 400 },
    )
  }
  const bounds = parseBounds(rawBounds)

  const rawLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT)
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT

  const style = searchParams.get('style')
  const accepting = searchParams.get('accepting')

  const inBounds = SHOPS.filter((shop) => {
    if (!bounds) return true
    const [swLat, swLng, neLat, neLng] = bounds
    return (
      shop.lat >= swLat && shop.lat <= neLat &&
      shop.lng >= swLng && shop.lng <= neLng
    )
  })

  const withArtists: ShopWithArtists[] = inBounds
    .map((shop) => ({
      ...shop,
      artists: ARTISTS.filter((artist) => {
        if (!artist.shopSlugs.includes(shop.slug)) return false
        if (style && !artist.styles.includes(style)) return false
        if (accepting === 'true' && !artist.acceptingClients) return false
        if (accepting === 'false' && artist.acceptingClients) return false
        return true
      }),
    }))
    // A style filter that matches nobody at a shop should drop the pin too.
    .filter((shop) => (style ?? accepting) === null || shop.artists.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))

  const body: ShopsResponse = {
    items: withArtists.slice(0, limit),
    truncated: withArtists.length > limit,
  }

  return Response.json(body)
}
