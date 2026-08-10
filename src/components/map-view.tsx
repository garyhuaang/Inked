'use client'

import { useEffect, useRef } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Bounds, ShopWithArtists } from '@/lib/types'

/** Keyless vector tiles. See https://openfreemap.org */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

/** Centred between Dallas and Austin so both metros are reachable on load. */
const INITIAL_CENTER: [number, number] = [-97.2, 31.5]
const INITIAL_ZOOM = 6.2

/** Pan/zoom fires continuously; only query after the user settles. */
const VIEWPORT_DEBOUNCE_MS = 300

interface MapViewProps {
  shops: ShopWithArtists[]
  onBoundsChange: (bounds: Bounds) => void
  onSelectShop: (slug: string | null) => void
  selectedSlug: string | null
}

function toGeoJSON(shops: ShopWithArtists[]) {
  return {
    type: 'FeatureCollection' as const,
    features: shops.map((shop) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [shop.lng, shop.lat] },
      properties: {
        slug: shop.slug,
        name: shop.name,
        artistCount: shop.artists.length,
      },
    })),
  }
}

export function MapView({
  shops,
  onBoundsChange,
  onSelectShop,
  selectedSlug,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)

  // Keep the latest callbacks reachable without re-running map setup.
  const onBoundsChangeRef = useRef(onBoundsChange)
  const onSelectShopRef = useRef(onSelectShop)
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
    onSelectShopRef.current = onSelectShop
  }, [onBoundsChange, onSelectShop])

  // Set up once. maplibre-gl touches `window` at import time, so it is loaded
  // dynamically here rather than at module scope — this file renders on the
  // server too, even as a Client Component.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let map: MapLibreMap | null = null
    let debounce: ReturnType<typeof setTimeout> | undefined
    let cancelled = false

    void (async () => {
      const maplibregl = (await import('maplibre-gl')).default
      if (cancelled) return

      map = new maplibregl.Map({
        container,
        style: STYLE_URL,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: { compact: true },
      })
      mapRef.current = map

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

      map.on('load', () => {
        if (!map) return

        map.addSource('shops', {
          type: 'geojson',
          data: toGeoJSON([]),
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 13,
        })

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'shops',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#18181b',
            'circle-radius': ['step', ['get', 'point_count'], 16, 5, 22, 15, 28],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'shops',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-size': 12,
          },
          paint: { 'text-color': '#ffffff' },
        })

        map.addLayer({
          id: 'shop-pins',
          type: 'circle',
          source: 'shops',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#18181b',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })

        const emitBounds = () => {
          if (!map) return
          const b = map.getBounds()
          onBoundsChangeRef.current([
            b.getSouth(),
            b.getWest(),
            b.getNorth(),
            b.getEast(),
          ])
        }

        emitBounds()

        map.on('moveend', () => {
          clearTimeout(debounce)
          debounce = setTimeout(emitBounds, VIEWPORT_DEBOUNCE_MS)
        })

        // Clicking a cluster zooms into it rather than selecting anything.
        map.on('click', 'clusters', (event) => {
          if (!map) return
          const feature = event.features?.[0]
          const clusterId: unknown = feature?.properties?.['cluster_id']
          if (typeof clusterId !== 'number') return

          const source = map.getSource('shops')
          if (!source || source.type !== 'geojson') return

          void source.getClusterExpansionZoom(clusterId).then((zoom) => {
            if (!map || feature?.geometry.type !== 'Point') return
            map.easeTo({
              center: feature.geometry.coordinates as [number, number],
              zoom,
            })
          })
        })

        map.on('click', 'shop-pins', (event) => {
          const slug: unknown = event.features?.[0]?.properties?.['slug']
          if (typeof slug === 'string') onSelectShopRef.current(slug)
        })

        // Clicking bare map clears the selection.
        map.on('click', (event) => {
          if (!map) return
          const hits = map.queryRenderedFeatures(event.point, {
            layers: ['clusters', 'shop-pins'],
          })
          if (hits.length === 0) onSelectShopRef.current(null)
        })

        for (const layer of ['clusters', 'shop-pins']) {
          map.on('mouseenter', layer, () => {
            if (map) map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', layer, () => {
            if (map) map.getCanvas().style.cursor = ''
          })
        }
      })
    })()

    return () => {
      cancelled = true
      clearTimeout(debounce)
      map?.remove()
      mapRef.current = null
    }
  }, [])

  // Push shop changes into the existing source instead of rebuilding the map.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const apply = () => {
      const source = map.getSource('shops')
      if (source && source.type === 'geojson') source.setData(toGeoJSON(shops))
    }

    if (map.isStyleLoaded()) apply()
    else map.once('load', apply)
  }, [shops])

  // Highlight whichever pin the list has selected.
  useEffect(() => {
    const map = mapRef.current
    if (!map?.getLayer('shop-pins')) return

    map.setPaintProperty('shop-pins', 'circle-color', [
      'case',
      ['==', ['get', 'slug'], selectedSlug ?? ''],
      '#7c3aed',
      '#18181b',
    ])
  }, [selectedSlug])

  return <div ref={containerRef} className="h-full w-full" />
}
