'use client';

import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/shadcnui/skeleton';
import { toggleShop, useAppDispatch, useAppSelector } from '@/lib/store';
import ArtistDetails from './ArtistDetails/ArtistDetails';
import type { ShopListProps } from './ShopList.types';

export function ShopList({ shops, loading, truncated }: ShopListProps) {
  const dispatch = useAppDispatch();
  const selectedSlug = useAppSelector((state) => state.ui.selectedSlug);

  const artistCount = shops.reduce(
    (total, shop) => total + shop.artists.length,
    0,
  );

  return (
    <section id="shop-list" className="flex h-full flex-col">
      <header className="border-b px-4 py-3">
        <h2 id="shop-list-heading" className="text-sm font-medium">
          {loading
            ? 'Searching this area…'
            : `${String(artistCount)} artists at ${String(shops.length)} shops`}
        </h2>
        <p className="text-xs text-muted-foreground">
          {truncated
            ? 'Too many results — zoom in to see them all.'
            : 'Showing what is inside the map view.'}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {loading && shops.length === 0 ? (
          <div aria-hidden="true" className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : shops.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">
            No shops in view. Pan or zoom out.
          </p>
        ) : (
          <ul id="shop-list-cards" className="flex flex-col gap-4">
            {shops.map((shop) => (
              <li key={shop.id}>
                <Card
                  className="gap-3 py-4"
                  header={shop.name}
                  selected={shop.slug === selectedSlug}
                  onToggle={() => dispatch(toggleShop(shop.slug))}
                  description={shop.address}
                  content={
                    shop.artists.length === 0 ? (
                      'No artists listed'
                    ) : (
                      <ul className="space-y-1.5">
                        {shop.artists.map((artist) => (
                          <ArtistDetails key={artist.id} artist={artist} />
                        ))}
                      </ul>
                    )
                  }
                  footer={shop.instagram}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
