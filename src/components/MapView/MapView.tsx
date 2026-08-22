'use client';

import { useEffect, useRef } from 'react';
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl';
import {
  INITIAL_CENTER,
  INITIAL_VIEW_BOUNDS,
  INITIAL_ZOOM,
} from '@/lib/constants';
import { MAP_STYLE_URL, MAPLIBRE_WORKER_URL } from '@/lib/urls';
import {
  selectShop,
  setBounds,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';
import type { MapViewProps } from './MapView.types';
import {
  clusterCount,
  PIN,
  PIN_SELECTED,
  shopClusters,
  shopPins,
} from './MapViewUtils/mapLayers';
import { toGeoJSON } from './MapViewUtils/mapSource';
import { registerMapInteractions } from './MapViewUtils/mapInteractions';
import { MapResetButton } from './MapViewComponents/MapResetButton';

const SELECTED_SHOP_ZOOM = 13;

export function MapView({ shops }: MapViewProps) {
  const dispatch = useAppDispatch();
  const selectedSlug = useAppSelector((state) => state.ui.selectedSlug);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const shopsRef = useRef(shops);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let createdMap: MapLibreMap | null = null;
    let disposeInteractions: (() => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;

    void (async () => {
      // maplibre-gl touches `window` at import time, so it cannot be imported
      // at module scope: this file is still evaluated during a server render.
      const maplibregl = await import('maplibre-gl');
      if (cancelled) return;

      maplibregl.setWorkerUrl(MAPLIBRE_WORKER_URL);

      const map = new maplibregl.Map({
        container,
        style: MAP_STYLE_URL,
        bounds: INITIAL_VIEW_BOUNDS,
        fitBoundsOptions: { padding: 40 },
        attributionControl: { compact: true },
      });
      createdMap = map;
      mapRef.current = map;

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right',
      );

      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(container);

      map.on('style.load', () => {
        map.addSource('shops', {
          type: 'geojson',
          data: toGeoJSON(shopsRef.current),
          cluster: true,
          clusterRadius: 50,
          clusterMaxZoom: 13,
        });

        map.addLayer(shopClusters);
        map.addLayer(clusterCount);
        map.addLayer(shopPins);

        readyRef.current = true;

        disposeInteractions = registerMapInteractions(map, {
          onBoundsChange: (bounds) => dispatch(setBounds(bounds)),
          onShopSelect: (slug) => dispatch(selectShop(slug)),
        });
      });
    })();

    return () => {
      cancelled = true;
      readyRef.current = false;
      disposeInteractions?.();
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

    const selectedShop = shopsRef.current.find(
      (shop) => shop.slug === selectedSlug,
    );
    if (!selectedShop) return;

    map.easeTo({
      center: [selectedShop.lng, selectedShop.lat],
      zoom: Math.max(map.getZoom(), SELECTED_SHOP_ZOOM),
    });
  }, [selectedSlug]);

  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;

    map.fitBounds(INITIAL_VIEW_BOUNDS, { padding: 40 });
    dispatch(selectShop(null));
  };

  return (
    <div className="relative h-full w-full">
      <MapResetButton onReset={resetView} />
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
