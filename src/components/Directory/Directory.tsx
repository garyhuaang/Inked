'use client';

import { MapView } from '@/components/MapView';
import { ShopList } from '@/components/ShopList';
import { useAppSelector, useGetShopsQuery } from '@/lib/store';

export function Directory() {
  const bounds = useAppSelector((state) => state.ui.bounds);
  const { data: shopsResponse, isFetching, isError } = useGetShopsQuery(bounds);
  const awaitingFirstResponse = shopsResponse === undefined && !isError;
  const loading = isFetching || awaitingFirstResponse;
  const shops = shopsResponse?.items ?? [];

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Inked</h1>
          <p className="text-xs text-muted-foreground">
            Tattoo artists in Dallas and Austin
          </p>
        </div>
        {isError ? (
          <p role="alert" className="text-xs text-destructive">
            Could not load this area.
          </p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        <aside
          aria-label="Shop list"
          className="h-1/2 w-full border-t md:h-auto md:w-96 md:border-t-0 md:border-r"
        >
          <ShopList
            shops={shops}
            loading={loading}
            truncated={shopsResponse?.truncated ?? false}
          />
        </aside>

        <main aria-label="Map" className="min-h-0 flex-1">
          <MapView shops={shops} />
        </main>
      </div>
    </div>
  );
}
