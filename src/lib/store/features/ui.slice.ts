import type { Bounds } from '@/lib/types'

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type UiState = {
  bounds: Bounds | null
  selectedSlug: string | null
}

const initialState: UiState = {
  bounds: null,
  selectedSlug: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setBounds: (state, action: PayloadAction<Bounds>) => {
      // The map re-emits on every settle; ignore no-ops so a viewport that did
      // not move does not invalidate the query and refetch.
      if (state.bounds?.every((value, i) => value === action.payload[i])) return

      state.bounds = action.payload
    },
    selectShop: (state, action: PayloadAction<string | null>) => {
      state.selectedSlug = action.payload
    },
    toggleShop: (state, action: PayloadAction<string>) => {
      state.selectedSlug =
        state.selectedSlug === action.payload ? null : action.payload
    },
  },
})

export const uiReducer = uiSlice.reducer
export const { setBounds, selectShop, toggleShop } = uiSlice.actions
