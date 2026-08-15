import type { ShopWithArtists } from '@/lib/api/types';

export type ShopListProps = {
  shops: ShopWithArtists[];
  loading: boolean;
  truncated: boolean;
};
