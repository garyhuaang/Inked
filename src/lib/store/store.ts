import { useDispatch, useSelector } from 'react-redux'

import { apiSlice } from './api'
import { uiReducer } from './features'

import { combineReducers, configureStore } from '@reduxjs/toolkit'

const rootReducer = combineReducers({
  ui: uiReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
})

/**
 * A factory rather than sas-mrts' exported singleton: this app renders on the
 * server, where one module-level store would be shared across every request —
 * and so across users. StoreProvider makes one per client instead.
 */
export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
