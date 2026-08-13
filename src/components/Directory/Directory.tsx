"use client";

import { MapView } from "@/components/MapView";
import { ShopList } from "@/components/ShopList";
import { useAppSelector, useGetShopsQuery } from "@/lib/store";

/** Layout only. Cancellation, de-duping and loading state belong to RTK Query. */
export function Directory() {
  const bounds = useAppSelector((state) => state.ui.bounds);
  const { data, isFetching, isError } = useGetShopsQuery(bounds);

  // The first client render happens before the query subscription starts, so
  // `isFetching` alone flashes "0 artists" for a frame during hydration.
  // "No data yet" is loading too — unless the fetch actually failed.
  const loading = isFetching || (data === undefined && !isError);

  const shops = data?.items ?? [];

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Inked</h1>
          <p className="text-muted-foreground text-xs">
            Tattoo artists in Dallas and Austin
          </p>
        </div>
        {isError ? (
          <p className="text-destructive text-xs">Could not load this area.</p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col-reverse md:flex-row">
        <aside className="h-1/2 w-full border-t md:h-auto md:w-96 md:border-t-0 md:border-r">
          <ShopList
            shops={shops}
            loading={loading}
            truncated={data?.truncated ?? false}
          />
        </aside>

        <main className="min-h-0 flex-1">
          <MapView shops={shops} />
        </main>
      </div>
    </div>
  );
}
