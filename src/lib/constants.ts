import type { Bounds } from '@/lib/api/types';

/** Centred between Dallas and Austin so both metros are reachable on load. */
export const INITIAL_CENTER: [number, number] = [-97.2, 31.5];
export const INITIAL_ZOOM = 7.2;

/**
 * Approximate viewport of INITIAL_CENTER at INITIAL_ZOOM. Seeding the store
 * with it lets the first shops query start at hydration, in parallel with the
 * map boot, instead of serially after it; the map refines to its exact bounds
 * on first settle. When the app expands beyond Texas, derive this from the
 * user's location instead.
 */
export const INITIAL_BOUNDS: Bounds = [28.4, -101.5, 34.5, -92.9];
