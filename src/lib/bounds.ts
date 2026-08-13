import type { Bounds } from '@/lib/types'

/** Parse `swLat,swLng,neLat,neLng` from a query string; null if malformed. */
export function parseBounds(raw: string | null): Bounds | null {
  if (!raw) return null

  const parts = raw.split(',').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null

  const [swLat, swLng, neLat, neLng] = parts as Bounds
  // A viewport crossing the antimeridian would invert lng; out of scope for Texas.
  if (swLat > neLat || swLng > neLng) return null

  return [swLat, swLng, neLat, neLng]
}
