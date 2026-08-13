import type { ShopWithArtists } from '@/lib/types';

export type ShopListProps = {
  shops: ShopWithArtists[];
  loading: boolean;
  truncated: boolean;
};
