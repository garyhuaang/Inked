import type { Bounds } from '@/lib/api/types';

export type UiState = {
  bounds: Bounds;
  selectedSlug: string | null;
};
