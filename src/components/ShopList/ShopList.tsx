"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/card";
import { Skeleton } from "@/components/common/skeleton";
import { toggleShop, useAppDispatch, useAppSelector } from "@/lib/store";
import ArtistDetails from "./ArtistDetails/ArtistDetails";
import type { ShopListProps } from "./ShopList.types";

export function ShopList({ shops, loading, truncated }: ShopListProps) {
  const dispatch = useAppDispatch();
  const selectedSlug = useAppSelector((state) => state.ui.selectedSlug);

  const artistCount = shops.reduce(
    (total, shop) => total + shop.artists.length,
    0,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">
          {loading
            ? "Searching this area…"
            : `${String(artistCount)} artists at ${String(shops.length)} shops`}
        </h2>
        <p className="text-muted-foreground text-xs">
          {truncated
            ? "Too many results — zoom in to see them all."
            : "Showing what is inside the map view."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading && shops.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : shops.length === 0 ? (
          <p className="text-muted-foreground px-1 py-8 text-center text-sm">
            No shops in view. Pan or zoom out.
          </p>
        ) : (
          <ul className="space-y-3">
            {shops.map((shop) => (
              <li key={shop.id}>
                <Card
                  onClick={() => dispatch(toggleShop(shop.slug))}
                  className={`cursor-pointer gap-3 py-4 transition-colors ${
                    shop.slug === selectedSlug
                      ? "border-primary bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <CardHeader className="px-4">
                    <CardTitle className="text-base">{shop.name}</CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {shop.address}
                    </p>
                  </CardHeader>
                  <CardContent className="px-4">
                    {shop.artists.length === 0 ? (
                      <p className="text-muted-foreground text-xs">
                        No artists listed yet.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {shop.artists.map((artist) => (
                          <ArtistDetails key={artist.id} artist={artist} />
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
