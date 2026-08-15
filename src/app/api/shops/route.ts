import { parseBounds } from '@/lib/api/bounds';
import { prisma } from '@/lib/db';
import type { ShopWithArtists, ShopsResponse } from '@/lib/api/types';

/**
 * GET /api/shops?bounds=swLat,swLng,neLat,neLng&style=&accepting=
 *
 * The bounding box is two BETWEENs against shops.lat / shops.lng, served by the
 * shops_lat_lng_idx index. PostGIS only earns its keep once queries stop being
 * rectangles.
 */

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const rawBounds = searchParams.get('bounds');
  const bounds = parseBounds(rawBounds);
  if (rawBounds !== null && bounds === null) {
    return Response.json(
      { error: 'bounds must be swLat,swLng,neLat,neLng' },
      { status: 400 },
    );
  }

  const rawLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const style = searchParams.get('style');
  const accepting = searchParams.get('accepting');

  const artistWhere = {
    ...(accepting === 'true' ? { acceptingClients: true } : {}),
    ...(accepting === 'false' ? { acceptingClients: false } : {}),
    ...(style ? { styles: { some: { style: { slug: style } } } } : {}),
  };
  const hasArtistFilter = Object.keys(artistWhere).length > 0;

  const rows = await prisma.shop.findMany({
    where: {
      ...(bounds && {
        lat: { gte: bounds[0], lte: bounds[2] },
        lng: { gte: bounds[1], lte: bounds[3] },
      }),
      // A style filter matching nobody at a shop should drop the pin too.
      ...(hasArtistFilter && { artists: { some: { artist: artistWhere } } }),
    },
    include: {
      artists: {
        ...(hasArtistFilter && { where: { artist: artistWhere } }),
        include: {
          artist: { include: { styles: { include: { style: true } } } },
        },
        orderBy: { artist: { name: 'asc' } },
      },
    },
    // Names are not unique, so id breaks the tie and keeps ordering stable.
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    // One extra row is how we learn there were more without a second COUNT.
    take: limit + 1,
  });

  const items: ShopWithArtists[] = rows.slice(0, limit).map((shop) => ({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    address: shop.address,
    city: shop.city,
    lat: shop.lat,
    lng: shop.lng,
    website: shop.website,
    instagram: shop.instagram,
    artists: shop.artists.map(({ artist }) => ({
      id: artist.id,
      name: artist.name,
      slug: artist.slug,
      instagram: artist.instagram,
      acceptingClients: artist.acceptingClients,
      styles: artist.styles.map(({ style }) => ({
        slug: style.slug,
        name: style.name,
      })),
    })),
  }));

  const body: ShopsResponse = { items, truncated: rows.length > limit };

  return Response.json(body);
}
