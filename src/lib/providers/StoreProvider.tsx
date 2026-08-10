'use client'

import { useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/store'
import type { StoreProviderProps } from './StoreProvider.types'

/**
 * The lazy `useState` initializer runs once per component instance, so each
 * client gets its own store — and unlike a ref it is safe to read during render.
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(makeStore)

  return <Provider store={store}>{children}</Provider>
}
