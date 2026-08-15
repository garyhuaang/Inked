'use client';

import { useEffect, useRef } from 'react';
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl';
import type { ShopWithArtists } from '@/lib/types';
import {
  selectShop,
  setBounds,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';
import type { MapViewProps } from './MapView.types';

/** Keyless vector tiles. See https://openfreemap.org */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

/** Centred between Dallas and Austin so both metros are reachable on load. */
const INITIAL_CENTER: [number, number] = [-97.2, 31.5];
const INITIAL_ZOOM = 6.2;

/** Pan/zoom fires continuously; only query after the user settles. */
const DEBOUNCE_MS = 300;

const PIN = '#18181b';
const PIN_SELECTED = '#7c3aed';

function toGeoJSON(shops: ShopWithArtists[]) {
  return {
    type: 'FeatureCollection' as const,
    features: shops.map((shop) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [shop.lng, shop.lat] },
      properties: { slug: shop.slug, name: shop.name },
    })),
  };
}

export function MapView({ shops }: MapViewProps) {
  const dispatch = useAppDispatch();
  const selectedSlug = useAppSelector((state) => state.ui.selectedSlug);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  // `isStyleLoaded()` stays false until every source has loaded, so it cannot
  // gate setData. Track readiness here, and keep the latest shops reachable
  // from setup, which runs once and cannot close over a changing prop.
  const readyRef = useRef(false);
  const shopsRef = useRef(shops);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let createdMap: MapLibreMap | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;

    void (async () => {
      // maplibre-gl touches `window` at import time, so it cannot be imported
      // at module scope: this file is still evaluated during a server render.
      const maplibregl = await import('maplibre-gl');
      if (cancelled) return;

      // MapLibre's default worker URL comes from `import.meta.url`, which
      // Turbopack rewrites to a non-http value; the fallback then spawns the
      // page itself as the worker, and no tiles ever load. Point it at the
      // copy that scripts/copy-maplibre-worker.mjs keeps in public/.
      maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

      const map = new maplibregl.Map({
        container,
        style: STYLE_URL,
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        attributionControl: { compact: true },
      });
      createdMap = map;
      mapRef.current = map;

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right',
      );

      // The container can still be 0-height here (CSS not yet applied), which
      // leaves the canvas unsized and stops MapLibre requesting any tiles.
      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);

      // 'style.load', not 'load': 'load' waits for a first visually complete
      // render, which never arrives if the canvas started unsized.
      map.on('style.load', () => {
        map.addSource('shops', {
          type: 'geojson',
          data: toGeoJSON(shopsRef.current),
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 13,
        });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'shops',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': PIN,
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              16,
              5,
              22,
              15,
              28,
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

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
        });

        map.addLayer({
          id: 'shop-pins',
          type: 'circle',
          source: 'shops',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': PIN,
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        readyRef.current = true;

        const emitBounds = () => {
          const viewBounds = map.getBounds();
          dispatch(
            setBounds([
              viewBounds.getSouth(),
              viewBounds.getWest(),
              viewBounds.getNorth(),
              viewBounds.getEast(),
            ]),
          );
        };

        emitBounds();

        map.on('moveend', () => {
          clearTimeout(settleTimer);
          settleTimer = setTimeout(emitBounds, DEBOUNCE_MS);
        });

        // A cluster zooms in rather than selecting anything.
        map.on('click', 'clusters', (event) => {
          const feature = event.features?.[0];
          const clusterId: unknown = feature?.properties['cluster_id'];
          if (typeof clusterId !== 'number') return;

          void map
            .getSource<GeoJSONSource>('shops')
            ?.getClusterExpansionZoom(clusterId)
            .then((zoom) => {
              if (feature?.geometry.type !== 'Point') return;
              const [lng, lat] = feature.geometry.coordinates;
              if (lng === undefined || lat === undefined) return;
              map.easeTo({ center: [lng, lat], zoom });
            });
        });

        map.on('click', 'shop-pins', (event) => {
          const slug: unknown = event.features?.[0]?.properties['slug'];
          if (typeof slug === 'string') dispatch(selectShop(slug));
        });

        map.on('click', (event) => {
          const clickedPins = map.queryRenderedFeatures(event.point, {
            layers: ['clusters', 'shop-pins'],
          });
          if (clickedPins.length === 0) dispatch(selectShop(null));
        });

        for (const layer of ['clusters', 'shop-pins']) {
          map.on('mouseenter', layer, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layer, () => {
            map.getCanvas().style.cursor = '';
          });
        }
      });
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
      clearTimeout(settleTimer);
      resizeObserver?.disconnect();
      createdMap?.remove();
      mapRef.current = null;
    };
  }, [dispatch]);

  // Push new results into the existing source instead of rebuilding the map.
  useEffect(() => {
    shopsRef.current = shops;
    if (!readyRef.current) return;

    mapRef.current
      ?.getSource<GeoJSONSource>('shops')
      ?.setData(toGeoJSON(shops));
  }, [shops]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer('shop-pins')) return;

    map.setPaintProperty('shop-pins', 'circle-color', [
      'case',
      ['==', ['get', 'slug'], selectedSlug ?? ''],
      PIN_SELECTED,
      PIN,
    ]);
  }, [selectedSlug]);

  return <div ref={containerRef} className="h-full w-full" />;
}
