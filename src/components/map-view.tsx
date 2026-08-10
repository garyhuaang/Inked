'use client'

import { useEffect, useRef } from 'react'
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl'
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

  // `isStyleLoaded()` stays false until every source has loaded, so it cannot
  // be used to decide whether the shops source is ready to accept data. Track
  // readiness ourselves, and keep the latest shops reachable from map setup.
  const styleReadyRef = useRef(false)
  const shopsRef = useRef(shops)
  shopsRef.current = shops

  // Keep the latest callbacks reachable without re-running map setup.
  const onBoundsChangeRef = useRef(onBoundsChange)
  const onSelectShopRef = useRef(onSelectShop)
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange
    onSelectShopRef.current = onSelectShop
  }, [onBoundsChange, onSelectShop])

  // Set up once. maplibre-gl touches `window` at import time, so it is loaded
  // dynamically here rather than at module scope — this file is still rendered
  // on the server, even as a Client Component.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let created: MapLibreMap | null = null
    let debounce: ReturnType<typeof setTimeout> | undefined
    let resizeObserver: ResizeObserver | undefined
    let cancelled = false

    void (async () => {
      const maplibregl = await import('maplibre-gl')
      if (cancelled) return

      const map = new maplibregl.Map({
        container,
        style: STYLE_URL,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: { compact: true },
      })
      created = map
      mapRef.current = map
      // TEMP DEBUG
      ;(window as unknown as { __map: MapLibreMap }).__map = map

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right',
      )

      // The container can still be 0-height when this runs (CSS not yet
      // applied), which leaves the canvas unsized and stops MapLibre from
      // requesting any tiles. Re-measure whenever the box changes.
      resizeObserver = new ResizeObserver(() => {
        map.resize()
      })
      resizeObserver.observe(container)

      // 'style.load' rather than 'load': 'load' waits for a first visually
      // complete render, which never arrives if the canvas starts unsized.
      map.on('style.load', () => {
        map.addSource('shops', {
          type: 'geojson',
          data: toGeoJSON(shopsRef.current),
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

        // Layers exist and the source will accept data from here on.
        styleReadyRef.current = true

        const emitBounds = () => {
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
          const feature = event.features?.[0]
          const clusterId: unknown = feature?.properties['cluster_id']
          if (typeof clusterId !== 'number') return

          const source = map.getSource<GeoJSONSource>('shops')
          if (!source) return

          void source.getClusterExpansionZoom(clusterId).then((zoom) => {
            if (feature?.geometry.type !== 'Point') return
            const [lng, lat] = feature.geometry.coordinates
            if (lng === undefined || lat === undefined) return
            map.easeTo({ center: [lng, lat], zoom })
          })
        })

        map.on('click', 'shop-pins', (event) => {
          const slug: unknown = event.features?.[0]?.properties['slug']
          if (typeof slug === 'string') onSelectShopRef.current(slug)
        })

        // Clicking bare map clears the selection.
        map.on('click', (event) => {
          const hits = map.queryRenderedFeatures(event.point, {
            layers: ['clusters', 'shop-pins'],
          })
          if (hits.length === 0) onSelectShopRef.current(null)
        })

        for (const layer of ['clusters', 'shop-pins']) {
          map.on('mouseenter', layer, () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', layer, () => {
            map.getCanvas().style.cursor = ''
          })
        }
      })
    })()

    return () => {
      cancelled = true
      styleReadyRef.current = false
      clearTimeout(debounce)
      resizeObserver?.disconnect()
      created?.remove()
      mapRef.current = null
    }
  }, [])

  // Push shop changes into the existing source instead of rebuilding the map.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !styleReadyRef.current) return

    map.getSource<GeoJSONSource>('shops')?.setData(toGeoJSON(shops))
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
