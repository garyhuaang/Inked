/**
 * Seed input for the Dallas and Austin tables.
 *
 * These are INVENTED shops and artists at real-ish coordinates. None of it is
 * scraped, and none of it describes a real business or person — it is
 * scaffolding to be replaced by the curated dataset in the spec's sequence.
 *
 * These types are deliberately NOT the API types in @/lib/types: this is what
 * goes INTO the database, keyed by slug, not what comes out of it.
 */

type SeedShop = {
  id: string
  name: string
  slug: string
  address: string
  city: 'dallas' | 'austin'
  lat: number
  lng: number
  website: string | null
  instagram: string | null
}

type SeedArtist = {
  id: string
  name: string
  slug: string
  instagram: string | null
  acceptingClients: boolean
  /** Style slugs, resolved to ids by the seed. */
  styles: string[]
  /** Shop slugs; the first is treated as primary. */
  shopSlugs: string[]
}

export const SHOPS: SeedShop[] = [
  {
    id: '11111111-1111-4111-8111-000000000001',
    name: 'Deep Ellum Electric',
    slug: 'deep-ellum-electric',
    address: '2700 Main St, Dallas, TX 75226',
    city: 'dallas',
    lat: 32.7838,
    lng: -96.7808,
    website: null,
    instagram: null,
  },
  {
    id: '11111111-1111-4111-8111-000000000002',
    name: 'Bishop Arts Tattoo Co.',
    slug: 'bishop-arts-tattoo-co',
    address: '408 N Bishop Ave, Dallas, TX 75208',
    city: 'dallas',
    lat: 32.7495,
    lng: -96.8285,
    website: null,
    instagram: null,
  },
  {
    id: '11111111-1111-4111-8111-000000000003',
    name: 'Lower Greenville Ink',
    slug: 'lower-greenville-ink',
    address: '1906 Greenville Ave, Dallas, TX 75206',
    city: 'dallas',
    lat: 32.8121,
    lng: -96.7699,
    website: null,
    instagram: null,
  },
  {
    id: '11111111-1111-4111-8111-000000000004',
    name: 'Trinity Groves Parlour',
    slug: 'trinity-groves-parlour',
    address: '3011 Gulden Ln, Dallas, TX 75212',
    city: 'dallas',
    lat: 32.7776,
    lng: -96.8329,
    website: null,
    instagram: null,
  },
  {
    id: '11111111-1111-4111-8111-000000000005',
    name: 'Oak Cliff Traditional',
    slug: 'oak-cliff-traditional',
    address: '835 W Davis St, Dallas, TX 75208',
    city: 'dallas',
    lat: 32.7449,
    lng: -96.8353,
    website: null,
    instagram: null,
  },
  {
    id: '22222222-2222-4222-8222-000000000001',
    name: 'South Congress Tattoo',
    slug: 'south-congress-tattoo',
    address: '1512 S Congress Ave, Austin, TX 78704',
    city: 'austin',
    lat: 30.2504,
    lng: -97.7501,
    website: null,
    instagram: null,
  },
  {
    id: '22222222-2222-4222-8222-000000000002',
    name: 'East Sixth Electric',
    slug: 'east-sixth-electric',
    address: '1200 E 6th St, Austin, TX 78702',
    city: 'austin',
    lat: 30.2646,
    lng: -97.7291,
    website: null,
    instagram: null,
  },
  {
    id: '22222222-2222-4222-8222-000000000003',
    name: 'Rainey Street Ink',
    slug: 'rainey-street-ink',
    address: '84 Rainey St, Austin, TX 78701',
    city: 'austin',
    lat: 30.2589,
    lng: -97.7395,
    website: null,
    instagram: null,
  },
  {
    id: '22222222-2222-4222-8222-000000000004',
    name: 'Hyde Park Fine Line',
    slug: 'hyde-park-fine-line',
    address: '4300 Duval St, Austin, TX 78751',
    city: 'austin',
    lat: 30.3095,
    lng: -97.7278,
    website: null,
    instagram: null,
  },
]

export const ARTISTS: SeedArtist[] = [
  {
    id: '33333333-3333-4333-8333-000000000001',
    name: 'Sam Ortiz',
    slug: 'sam-ortiz',
    instagram: null,
    styles: ['traditional', 'blackwork'],
    acceptingClients: true,
    shopSlugs: ['deep-ellum-electric'],
  },
  {
    id: '33333333-3333-4333-8333-000000000002',
    name: 'Ava Reyes',
    slug: 'ava-reyes',
    instagram: null,
    styles: ['fine-line'],
    acceptingClients: false,
    shopSlugs: ['deep-ellum-electric', 'lower-greenville-ink'],
  },
  {
    id: '33333333-3333-4333-8333-000000000003',
    name: 'Marcus Webb',
    slug: 'marcus-webb',
    instagram: null,
    styles: ['japanese'],
    acceptingClients: true,
    shopSlugs: ['bishop-arts-tattoo-co'],
  },
  {
    id: '33333333-3333-4333-8333-000000000004',
    name: 'Priya Nair',
    slug: 'priya-nair',
    instagram: null,
    styles: ['fine-line', 'blackwork'],
    acceptingClients: true,
    shopSlugs: ['bishop-arts-tattoo-co', 'oak-cliff-traditional'],
  },
  {
    id: '33333333-3333-4333-8333-000000000005',
    name: 'Dee Coleman',
    slug: 'dee-coleman',
    instagram: null,
    styles: ['traditional'],
    acceptingClients: false,
    shopSlugs: ['lower-greenville-ink'],
  },
  {
    id: '33333333-3333-4333-8333-000000000006',
    name: 'Tomas Vega',
    slug: 'tomas-vega',
    instagram: null,
    styles: ['blackwork', 'japanese'],
    acceptingClients: true,
    shopSlugs: ['trinity-groves-parlour'],
  },
  {
    id: '33333333-3333-4333-8333-000000000007',
    name: 'Nia Brooks',
    slug: 'nia-brooks',
    instagram: null,
    styles: ['fine-line'],
    acceptingClients: true,
    shopSlugs: ['oak-cliff-traditional'],
  },
  {
    id: '33333333-3333-4333-8333-000000000008',
    name: 'Sam Ortiz',
    slug: 'sam-ortiz-austin',
    instagram: null,
    styles: ['traditional'],
    acceptingClients: true,
    shopSlugs: ['south-congress-tattoo'],
  },
  {
    id: '33333333-3333-4333-8333-000000000009',
    name: 'Kai Lindqvist',
    slug: 'kai-lindqvist',
    instagram: null,
    styles: ['blackwork'],
    acceptingClients: false,
    shopSlugs: ['south-congress-tattoo', 'rainey-street-ink'],
  },
  {
    id: '33333333-3333-4333-8333-000000000010',
    name: 'Rosa Delgado',
    slug: 'rosa-delgado',
    instagram: null,
    styles: ['japanese', 'traditional'],
    acceptingClients: true,
    shopSlugs: ['east-sixth-electric'],
  },
  {
    id: '33333333-3333-4333-8333-000000000011',
    name: 'Ben Whitfield',
    slug: 'ben-whitfield',
    instagram: null,
    styles: ['fine-line'],
    acceptingClients: true,
    shopSlugs: ['east-sixth-electric', 'hyde-park-fine-line'],
  },
  {
    id: '33333333-3333-4333-8333-000000000012',
    name: 'Jules Park',
    slug: 'jules-park',
    instagram: null,
    styles: ['blackwork', 'fine-line'],
    acceptingClients: false,
    shopSlugs: ['rainey-street-ink'],
  },
  {
    id: '33333333-3333-4333-8333-000000000013',
    name: 'Ana Villareal',
    slug: 'ana-villareal',
    instagram: null,
    styles: ['traditional'],
    acceptingClients: true,
    shopSlugs: ['hyde-park-fine-line'],
  },
]

export const STYLE_LABELS: Record<string, string> = {
  traditional: 'Traditional',
  blackwork: 'Blackwork',
  'fine-line': 'Fine line',
  japanese: 'Japanese',
}
