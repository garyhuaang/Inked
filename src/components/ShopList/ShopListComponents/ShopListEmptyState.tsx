import type { ShopListEmptyStateProps } from '../ShopList.types';
import { ShopListSkeletons } from './ShopListSkeletons';

export function ShopListEmptyState({ loading }: ShopListEmptyStateProps) {
  if (loading) return <ShopListSkeletons />;

  return (
    <p className="px-1 py-8 text-center text-sm text-muted-foreground">
      No shops in view. Pan or zoom out.
    </p>
  );
}
