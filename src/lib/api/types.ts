/** API shapes. The database schema itself lives in prisma/schema.prisma. */

export type Metro = 'dfw' | 'austin';

export interface Shop {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  metro: Metro;
  lat: number;
  lng: number;
  website: string | null;
  instagram: string | null;
}

export interface Style {
  slug: string;
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

export interface ShopWithArtists extends Shop {
  artists: Artist[];
}

/** swLat, swLng, neLat, neLng — the order used by the ?bounds= query param. */
export type Bounds = [number, number, number, number];

export interface ShopsResponse {
  items: ShopWithArtists[];
  truncated: boolean;
}
