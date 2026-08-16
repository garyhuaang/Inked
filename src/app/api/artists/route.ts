import { prisma } from '@/lib/db';
import { Artist, ArtistResponse } from '@/lib/api/types';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);

  const rawLimit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT);
  const derivedLimit = Math.max(Math.trunc(rawLimit), 1);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(derivedLimit, MAX_LIMIT)
    : DEFAULT_LIMIT;

  const accepting = searchParams.get('accepting');
  const name = searchParams.get('name');
  const style = searchParams.get('style');

  const artistWhere = {
    ...(accepting === 'true' ? { acceptingClients: true } : {}),
    ...(accepting === 'false' ? { acceptingClients: false } : {}),
    ...(style ? { styles: { some: { style: { slug: style } } } } : {}),
    ...(name ? { name: { contains: name, mode: 'insensitive' as const } } : {}),
  };

  const rows = await prisma.artist.findMany({
    where: artistWhere,
    include: { styles: { include: { style: true } } },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
    take: limit + 1,
  });

  const items: Artist[] = rows.slice(0, limit).map((artist) => ({
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    instagram: artist.instagram,
    acceptingClients: artist.acceptingClients,
    styles: artist.styles.map(({ style }) => ({
      slug: style.slug,
      name: style.name,
    })),
  }));

  const body: ArtistResponse = { items, truncated: rows.length > limit };

  return Response.json(body);
}
