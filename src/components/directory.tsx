'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MapView } from '@/components/map-view'
import { ShopList } from '@/components/shop-list'
import type { Bounds, ShopWithArtists, ShopsResponse } from '@/lib/types'

/**
 * Owns the map/list sync: the map reports its viewport, this fetches, and both
 * panes render the same result set.
 */
export function Directory() {
  const [shops, setShops] = useState<ShopWithArtists[]>([])
  const [truncated, setTruncated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const [bounds, setBounds] = useState<Bounds | null>(null)
  // A slow early response must not overwrite a fast later one.
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!bounds) return

    const requestId = ++requestIdRef.current
    const controller = new AbortController()

    setLoading(true)
    void (async () => {
      try {
        const response = await fetch(`/api/shops?bounds=${bounds.join(',')}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Request failed: ${String(response.status)}`)

        const body = (await response.json()) as ShopsResponse
        if (requestId !== requestIdRef.current) return

        setShops(body.items)
        setTruncated(body.truncated)
        setError(null)
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        if (requestId !== requestIdRef.current) return
        setError(cause instanceof Error ? cause.message : 'Something went wrong')
      } finally {
        if (requestId === requestIdRef.current) setLoading(false)
      }
    })()

    return () => {
      controller.abort()
    }
  }, [bounds])

  const handleBoundsChange = useCallback((next: Bounds) => {
    setBounds((current) =>
      current && current.every((value, i) => value === next[i]) ? current : next,
    )
  }, [])

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Inked</h1>
          <p className="text-muted-foreground text-xs">
            Tattoo artists in Dallas and Austin
          </p>
        </div>
        {error ? (
          <p className="text-destructive text-xs">{error}</p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        <aside className="h-1/2 w-full border-t md:h-auto md:w-96 md:border-t-0 md:border-r">
          <ShopList
            shops={shops}
            loading={loading}
            truncated={truncated}
            selectedSlug={selectedSlug}
            onSelectShop={setSelectedSlug}
          />
        </aside>

        <main className="min-h-0 flex-1">
          <MapView
            shops={shops}
            onBoundsChange={handleBoundsChange}
            onSelectShop={setSelectedSlug}
            selectedSlug={selectedSlug}
          />
        </main>
      </div>
    </div>
  )
}
