import type { Bounds } from '@/lib/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UiState } from './ui.slice.types';

/**
 * Approximate viewport of MapView's INITIAL_CENTER/INITIAL_ZOOM. Seeding it
 * lets the first shops query start at hydration, in parallel with the map
 * boot (chunk download + style load), instead of serially after it. The map
 * refines to its exact bounds on first settle.
 * When app is ready to expand, INITIAL_BOUNDS should be based on user's current location
 */
const INITIAL_BOUNDS: Bounds = [28.4, -101.5, 34.5, -92.9];

const initialState: UiState = {
  bounds: INITIAL_BOUNDS,
  selectedSlug: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBounds: (state, action: PayloadAction<Bounds>) => {
      // A no-op write would still notify subscribers and refetch.
      const viewportUnchanged = state.bounds.every(
        (coordinate, i) => coordinate === action.payload[i],
      );
      if (viewportUnchanged) return;

      state.bounds = action.payload;
    },
    selectShop: (state, action: PayloadAction<string | null>) => {
      state.selectedSlug = action.payload;
    },
    toggleShop: (state, action: PayloadAction<string>) => {
      state.selectedSlug =
        state.selectedSlug === action.payload ? null : action.payload;
    },
  },
});

export const uiReducer = uiSlice.reducer;
export const { setBounds, selectShop, toggleShop } = uiSlice.actions;
