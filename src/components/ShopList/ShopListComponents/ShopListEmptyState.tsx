import type { ShopListEmptyStateProps } from '../ShopList.types';
import { ShopListSkeletons } from './ShopListSkeletons';

/** What the list shows when there are no cards: placeholders while a search
 * is in flight, otherwise the no-results message. */
export function ShopListEmptyState({ loading }: ShopListEmptyStateProps) {
  if (loading) return <ShopListSkeletons />;

  return (
    <p className="px-1 py-8 text-center text-sm text-muted-foreground">
      No shops in view. Pan or zoom out.
    </p>
  );
}
