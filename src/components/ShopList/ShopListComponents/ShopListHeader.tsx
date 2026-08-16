import type { ShopListHeaderProps } from '../ShopList.types';

export function ShopListHeader({
  loading,
  truncated,
  artistCount,
  shopCount,
}: ShopListHeaderProps) {
  return (
    <header className="border-b px-4 py-3">
      <h2 id="shop-list-heading" className="text-sm font-medium">
        {loading
          ? 'Searching this area…'
          : `${String(artistCount)} artists at ${String(shopCount)} shops`}
      </h2>
      <p className="text-xs text-muted-foreground">
        {truncated
          ? 'Too many results — zoom in to see them all.'
          : 'Showing what is inside the map view.'}
      </p>
    </header>
  );
}
