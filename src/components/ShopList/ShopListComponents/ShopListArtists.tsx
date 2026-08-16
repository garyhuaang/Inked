import { Badge } from '@/components/common/shadcnui/badge';
import type { ShopListArtistsProps } from '../ShopList.types';

export function ShopListArtists({ artist }: ShopListArtistsProps) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span>{artist.name}</span>
      <ul className="flex flex-wrap items-center gap-1">
        {artist.styles.map((style) => (
          <li key={style.slug}>
            <Badge variant="secondary">{style.name}</Badge>
          </li>
        ))}
        {artist.acceptingClients ? (
          <li>
            <Badge variant="outline">Booking</Badge>
          </li>
        ) : null}
      </ul>
    </li>
  );
}
