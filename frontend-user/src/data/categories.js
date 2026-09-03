// Property typologies — mirrors the backend `properties.category` column.

export const CATEGORIES = [
  {
    slug: 'apartment',
    label: 'Apartment',
    plural: 'Apartments',
    blurb: 'Flats and condominiums in managed towers and boutique blocks.',
    image: '/images/cat-apartment.jpg',
  },
  {
    slug: 'shop',
    label: 'Shop',
    plural: 'Shops & Retail',
    blurb: 'High-street units, showrooms and ground-floor commercial space.',
    image: '/images/cat-shop.jpg',
  },
  {
    slug: 'single_floor',
    label: 'Single Floor',
    plural: 'Single Floor Homes',
    blurb: 'Ground-level houses, farmhouses and row houses on a single plan.',
    image: '/images/cat-single-floor.jpg',
  },
  {
    slug: 'duplex',
    label: 'Duplex',
    plural: 'Duplex Homes',
    blurb: 'Two-level residences within a single unit — villas and penthouses.',
    image: '/images/cat-duplex.jpg',
  },
  {
    slug: 'double_floor',
    label: 'Double Floor',
    plural: 'Double Floor Homes',
    blurb: 'Independent G+1 houses and bungalows on their own land.',
    image: '/images/cat-double-floor.jpg',
  },
  {
    slug: 'third_floor',
    label: 'Third Floor',
    plural: 'Third Floor Homes',
    blurb: 'G+2 houses, builder floors and triplexes with terrace rights.',
    image: '/images/cat-third-floor.jpg',
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export const categoryLabel = (slug) => CATEGORY_BY_SLUG[slug]?.label || null;
