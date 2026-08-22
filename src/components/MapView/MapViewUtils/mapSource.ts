import type { ShopWithArtists } from '@/lib/api/types';

export function toGeoJSON(shops: ShopWithArtists[]) {
  return {
    type: 'FeatureCollection' as const,
    features: shops.map((shop) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [shop.lng, shop.lat] },
      properties: { slug: shop.slug, name: shop.name },
    })),
  };
}
