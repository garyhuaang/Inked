import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../src/generated/prisma/client';
import { ARTISTS, SHOPS, STYLE_LABELS } from './seed-data';

const connectionString =
  process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'];
if (!connectionString)
  throw new Error('DIRECT_URL or DATABASE_URL must be set');

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  await prisma.shop.deleteMany({
    where: { slug: { notIn: SHOPS.map((incoming) => incoming.slug) } },
  });
  await prisma.artist.deleteMany({
    where: { slug: { notIn: ARTISTS.map((incoming) => incoming.slug) } },
  });
  await prisma.style.deleteMany({
    where: { slug: { notIn: Object.keys(STYLE_LABELS) } },
  });

  const styleIdBySlug = new Map<string, string>();
  for (const [slug, name] of Object.entries(STYLE_LABELS)) {
    const style = await prisma.style.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
    styleIdBySlug.set(slug, style.id);
  }

  const shopIdBySlug = new Map<string, string>();
  for (const shop of SHOPS) {
    const saved = await prisma.shop.upsert({
      where: { slug: shop.slug },
      update: shop,
      create: shop,
    });
    shopIdBySlug.set(shop.slug, saved.id);
  }

  for (const { shopSlugs, styles, ...artist } of ARTISTS) {
    await prisma.artist.upsert({
      where: { slug: artist.slug },
      update: artist,
      create: artist,
    });

    // Join rows are replaced wholesale rather than diffed — the seed is their
    // only writer, so this stays correct and is easier to reason about.
    await prisma.artistStyle.deleteMany({ where: { artistId: artist.id } });
    await prisma.artistStyle.createMany({
      data: styles.flatMap((slug) => {
        const styleId = styleIdBySlug.get(slug);
        return styleId ? [{ artistId: artist.id, styleId }] : [];
      }),
    });

    await prisma.artistShop.deleteMany({ where: { artistId: artist.id } });
    await prisma.artistShop.createMany({
      data: shopSlugs.flatMap((slug, i) => {
        const shopId = shopIdBySlug.get(slug);
        return shopId
          ? [{ artistId: artist.id, shopId, isPrimary: i === 0 }]
          : [];
      }),
    });
  }

  console.log('seeded', {
    styles: await prisma.style.count(),
    shops: await prisma.shop.count(),
    artists: await prisma.artist.count(),
    artistShops: await prisma.artistShop.count(),
    artistStyles: await prisma.artistStyle.count(),
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());
