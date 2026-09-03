import { IMAGES } from './images';

export const SERVICES = [
  {
    slug: 'buy',
    title: 'Buy',
    summary:
      'Curated access to residences and investment assets, with advisory from first viewing to closing.',
    image: IMAGES.services.buy,
    points: [
      'Off-market and pre-launch opportunities',
      'Independent valuation and due diligence',
      'Negotiation and closing management',
    ],
    cta: { label: 'Browse listings', to: '/buy' },
  },
  {
    slug: 'sell',
    title: 'Sell',
    summary:
      'Positioning, photography and a qualified buyer network that presents your property at its best.',
    image: IMAGES.services.sell,
    points: [
      'Architectural photography and staging direction',
      'Targeted campaign to vetted buyers',
      'Transparent reporting throughout',
    ],
    cta: { label: 'List your property', to: '/sell' },
  },
  {
    slug: 'rent',
    title: 'Rent',
    summary:
      'Long and short-term rentals across the managed portfolio, matched to how you actually live.',
    image: IMAGES.services.rent,
    points: [
      'Verified listings with full disclosure',
      'Digital applications and contracts',
      'Dedicated tenant support',
    ],
    cta: { label: 'View rentals', to: '/rent' },
  },
  {
    slug: 'manage',
    title: 'Property Management',
    summary:
      'Full-service management for owners — maintenance, tenancy and financials handled end to end.',
    image: IMAGES.services.manage,
    points: [
      'Proactive maintenance and inspections',
      'Rent collection and owner statements',
      'Compliance and renewals',
    ],
    cta: { label: 'Talk to us', to: '/contact' },
  },
  {
    slug: 'design',
    title: 'Architecture & Design',
    summary:
      'The studio practice: bespoke architecture, interiors and renovation for private and commercial clients.',
    image: IMAGES.services.design,
    points: [
      'Concept design through construction administration',
      'Interior architecture and furnishing',
      'Renovation and adaptive reuse',
    ],
    cta: { label: 'See selected works', to: '/properties' },
  },
];

export const PROCESS = [
  { step: '01', title: 'Consultation', desc: 'We listen to your brief, budget and timeline, then map the route.' },
  { step: '02', title: 'Strategy', desc: 'A tailored plan — whether that is a search shortlist or a design concept.' },
  { step: '03', title: 'Execution', desc: 'Negotiation, delivery or construction, managed by a single point of contact.' },
  { step: '04', title: 'Handover', desc: 'Keys, documents and aftercare — the relationship continues past completion.' },
];

export const serviceBySlug = (slug) => SERVICES.find((s) => s.slug === slug);
