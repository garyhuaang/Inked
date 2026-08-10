import { STYLE_LABELS } from "@/lib/sample-data";
import { Badge } from "@/components/common/badge";
import type { ArtistDetailsProps } from "./ArtistDetails.types";

function ArtistDetails({ artist }: ArtistDetailsProps) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
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
  );
}

export default ArtistDetails;
