/** Shapes here mirror the tables sketched in Tattoo-Directory-Spec.md. */

export type City = 'dallas' | 'austin'

export interface Shop {
  id: string
  name: string
  slug: string
  address: string
  city: City
  lat: number
  lng: number
  website: string | null
  instagram: string | null
}

export interface Artist {
  id: string
  name: string
  slug: string
  instagram: string | null
  /** Style slugs; a `styles` table replaces this once Prisma lands. */
  styles: string[]
  acceptingClients: boolean
  /** Shop slugs. Many-to-many, per the `artist_shops` decision in the spec. */
  shopSlugs: string[]
}

/** A shop plus the artists working there, which is what the list panel renders. */
export interface ShopWithArtists extends Shop {
  artists: Artist[]
}

/** swLat, swLng, neLat, neLng — the order used by the ?bounds= query param. */
export type Bounds = [number, number, number, number]

export interface ShopsResponse {
  items: ShopWithArtists[]
  /** True when the viewport matched more shops than `limit`. Drives "zoom in". */
  truncated: boolean
}
