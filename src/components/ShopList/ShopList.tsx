'use client';

import { Card } from '@/components/common/Card';
import { toggleShop, useAppDispatch, useAppSelector } from '@/lib/store';
import type { ShopListProps } from './ShopList.types';
import {
  ShopListArtists,
  ShopListEmptyState,
  ShopListHeader,
} from './ShopListComponents';

export function ShopList({ shops, loading, truncated }: ShopListProps) {
  const dispatch = useAppDispatch();
  const selectedSlug = useAppSelector((state) => state.ui.selectedSlug);

  const artistCount = shops.reduce(
    (total, shop) => total + shop.artists.length,
    0,
  );

  return (
    <section id="shop-list" className="flex h-full flex-col">
      <ShopListHeader
        loading={loading}
        truncated={truncated}
        artistCount={artistCount}
        shopCount={shops.length}
      />

      <div className="flex-1 overflow-y-auto p-3">
        {shops.length === 0 ? (
          <ShopListEmptyState loading={loading} />
        ) : (
          <ul id="shop-list-cards" className="flex flex-col gap-4">
            {shops.map((shop) => (
              <li key={shop.id}>
                <Card
                  header={shop.name}
                  selected={shop.slug === selectedSlug}
                  onToggle={() => dispatch(toggleShop(shop.slug))}
                  description={shop.address}
                  contentList={shop.artists.map((artist) => (
                    <ShopListArtists key={artist.id} artist={artist} />
                  ))}
                  emptyContent="No artists listed"
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
