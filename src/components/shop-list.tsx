'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { STYLE_LABELS } from '@/lib/sample-data'
import type { ShopWithArtists } from '@/lib/types'

interface ShopListProps {
  shops: ShopWithArtists[]
  loading: boolean
  truncated: boolean
  selectedSlug: string | null
  onSelectShop: (slug: string | null) => void
}

export function ShopList({
  shops,
  loading,
  truncated,
  selectedSlug,
  onSelectShop,
}: ShopListProps) {
  const artistCount = shops.reduce((total, shop) => total + shop.artists.length, 0)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">
          {loading
            ? 'Searching this area…'
            : `${String(artistCount)} artist${artistCount === 1 ? '' : 's'} at ${String(shops.length)} shop${shops.length === 1 ? '' : 's'}`}
        </h2>
        <p className="text-muted-foreground text-xs">
          {truncated
            ? 'Too many results — zoom in to see them all.'
            : 'Showing what is inside the map view.'}
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
                  onClick={() => {
                    onSelectShop(shop.slug === selectedSlug ? null : shop.slug)
                  }}
                  className={`cursor-pointer gap-3 py-4 transition-colors ${
                    shop.slug === selectedSlug
                      ? 'border-primary bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <CardHeader className="px-4">
                    <CardTitle className="text-base">{shop.name}</CardTitle>
                    <p className="text-muted-foreground text-xs">{shop.address}</p>
                  </CardHeader>
                  <CardContent className="px-4">
                    {shop.artists.length === 0 ? (
                      <p className="text-muted-foreground text-xs">
                        No artists listed yet.
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {shop.artists.map((artist) => (
                          <li
                            key={artist.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span>{artist.name}</span>
                            <span className="flex flex-wrap items-center gap-1">
                              {artist.styles.map((style) => (
                                <Badge key={style} variant="secondary">
                                  {STYLE_LABELS[style] ?? style}
                                </Badge>
                              ))}
                              {artist.acceptingClients ? (
                                <Badge variant="outline">Booking</Badge>
                              ) : null}
                            </span>
                          </li>
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
  )
}
