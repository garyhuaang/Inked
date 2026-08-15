/** API shapes. The database schema itself lives in prisma/schema.prisma. */

export type City = 'dallas' | 'austin';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: City;
  lat: number;
  lng: number;
  website: string | null;
  instagram: string | null;
}

export interface Style {
  slug: string;
  /** Display label, e.g. "Fine line". Comes from the styles table. */
  name: string;
}

export interface Artist {
  id: string;
  name: string;
  slug: string;
  instagram: string | null;
  styles: Style[];
  acceptingClients: boolean;
}

/** A shop plus the artists working there, which is what the list panel renders. */
export interface ShopWithArtists extends Shop {
  artists: Artist[];
}

/** swLat, swLng, neLat, neLng — the order used by the ?bounds= query param. */
export type Bounds = [number, number, number, number];

export interface ShopsResponse {
  items: ShopWithArtists[];
  /** True when the viewport matched more shops than `limit`. Drives "zoom in". */
  truncated: boolean;
}
