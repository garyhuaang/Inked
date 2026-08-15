import type { Bounds } from '@/lib/api/types';

/** Parse a `?bounds=` query param; null if malformed. */
export function parseBounds(raw: string | null): Bounds | null {
  if (!raw) return null;

  const coords = raw.split(',').map(Number);
  if (coords.length !== 4 || coords.some((coord) => !Number.isFinite(coord)))
    return null;

  const [swLat, swLng, neLat, neLng] = coords as Bounds;
  // A viewport crossing the antimeridian would invert lng; out of scope for Texas.
  if (swLat > neLat || swLng > neLng) return null;

  return [swLat, swLng, neLat, neLng];
}
