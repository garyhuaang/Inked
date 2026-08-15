import { INITIAL_BOUNDS } from '@/lib/constants';
import type { Bounds } from '@/lib/api/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { UiState } from './ui.slice.types';

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
