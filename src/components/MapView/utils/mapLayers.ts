import type { AddLayerObject, CircleLayerSpecification } from 'maplibre-gl';

export const PIN = '#18181b';
export const PIN_SELECTED = '#7c3aed';

export const shopPins: CircleLayerSpecification = {
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
};

export const shopClusters: CircleLayerSpecification = {
  id: 'clusters',
  type: 'circle',
  source: 'shops',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': PIN,
    'circle-radius': ['step', ['get', 'point_count'], 16, 5, 22, 15, 28],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
};

export const clusterCount: AddLayerObject = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'shops',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-size': 12,
  },
  paint: { 'text-color': '#ffffff' },
};
