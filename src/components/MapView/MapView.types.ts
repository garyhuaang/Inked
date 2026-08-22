import type { ShopWithArtists } from '@/lib/api/types';

export type MapViewProps = {
  shops: ShopWithArtists[];
};

export type MapResetButtonProps = {
  onReset: () => void;
};
