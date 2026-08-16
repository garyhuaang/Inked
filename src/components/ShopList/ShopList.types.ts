import type { Artist, ShopWithArtists } from '@/lib/api/types';

export type ShopListProps = {
  shops: ShopWithArtists[];
  loading: boolean;
  truncated: boolean;
};

export type ShopListArtistsProps = {
  artist: Artist;
};

export type ShopListEmptyStateProps = {
  loading: boolean;
};

export type ShopListHeaderProps = {
  loading: boolean;
  truncated: boolean;
  artistCount: number;
  shopCount: number;
};
