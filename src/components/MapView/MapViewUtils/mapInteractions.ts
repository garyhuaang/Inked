import type { Bounds } from '@/lib/api/types';
import type { GeoJSONSource, MapLibreMap } from 'maplibre-gl';

const DEBOUNCE_MS = 300;

type MapInteractionCallbacks = {
  onBoundsChange: (bounds: Bounds) => void;
  onShopSelect: (slug: string | null) => void;
};

export function registerMapInteractions(
  map: MapLibreMap,
  { onBoundsChange, onShopSelect }: MapInteractionCallbacks,
): () => void {
  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  const emitBounds = () => {
    const viewBounds = map.getBounds();
    onBoundsChange([
      viewBounds.getSouth(),
      viewBounds.getWest(),
      viewBounds.getNorth(),
      viewBounds.getEast(),
    ]);
  };

  emitBounds();

  map.on('moveend', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(emitBounds, DEBOUNCE_MS);
  });

  // A cluster zooms in rather than selecting anything.
  map.on('click', 'clusters', (event) => {
    const clusterFeature = event.features?.[0];
    const clusterId: unknown = clusterFeature?.properties['cluster_id'];
    if (typeof clusterId !== 'number') return;

    void map
      .getSource<GeoJSONSource>('shops')
      ?.getClusterExpansionZoom(clusterId)
      .then((zoom) => {
        if (clusterFeature?.geometry.type !== 'Point') return;
        const [lng, lat] = clusterFeature.geometry.coordinates;
        if (lng === undefined || lat === undefined) return;
        map.easeTo({ center: [lng, lat], zoom });
      });
  });

  map.on('click', 'shop-pins', (event) => {
    const slug: unknown = event.features?.[0]?.properties['slug'];
    if (typeof slug === 'string') onShopSelect(slug);
  });

  map.on('click', (event) => {
    const clickedPins = map.queryRenderedFeatures(event.point, {
      layers: ['clusters', 'shop-pins'],
    });
    if (clickedPins.length === 0) onShopSelect(null);
  });

  for (const layerId of ['clusters', 'shop-pins']) {
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });
  }

  return () => {
    clearTimeout(settleTimer);
  };
}
