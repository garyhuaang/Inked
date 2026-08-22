import type { Bounds } from '@/lib/api/types';

/** Centred between Dallas and Austin so both metros are reachable on load. */
export const INITIAL_CENTER: [number, number] = [-97.2, 31.5];
export const INITIAL_ZOOM = 7.2;
export const INITIAL_BOUNDS: Bounds = [28.4, -101.5, 34.5, -92.9];

export const INITIAL_VIEW_BOUNDS: [[number, number], [number, number]] = [
  [-98.1, 29.9], // southwest: lng, lat (covers Austin)
  [-96.4, 33.3], // northeast: lng, lat (covers DFW)
];
