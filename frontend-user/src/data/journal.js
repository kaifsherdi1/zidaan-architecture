import { IMAGES } from './images';

export const JOURNAL = [
  {
    slug: 'light-as-material',
    title: 'Light as a Building Material',
    category: 'Philosophy',
    date: '2024-11-18',
    readingTime: '6 min',
    image: IMAGES.journal[0],
    excerpt:
      'How the studio treats daylight as a structural element — something to be shaped, measured and detailed rather than left to chance.',
    body: [
      'Every project in the studio begins with a sun study. Before a single wall is drawn, we model how light will enter the site across a full year — the low winter rake, the high summer wash, the brief moments of direct sun that a north-facing room might catch.',
      'This is not a romantic exercise. Daylight is quantifiable, and treating it as a material means giving it the same rigour we give concrete or glass. Aperture size, reveal depth, the exact height of a clerestory — these are decisions with numbers behind them.',
      'The reward is architecture that changes through the day without anyone touching a switch. A stair that glows at breakfast and falls quiet by evening. A courtyard that becomes the brightest room in the house at noon.',
      'When light is designed rather than admitted, a building needs less of everything else: less artificial lighting, less mechanical cooling, fewer decorative moves to make a plain room feel considered.',
    ],
  },
  {
    slug: 'buying-off-market',
    title: 'A Buyer’s Guide to Off-Market Property',
    category: 'Real Estate',
    date: '2024-10-30',
    readingTime: '8 min',
    image: IMAGES.journal[1],
    excerpt:
      'The best homes rarely reach a portal. Here is how private sales actually work, and what to prepare before you enquire.',
    body: [
      'A significant share of high-end transactions never appear on a public listing site. Sellers value discretion, and agents protect relationships by circulating opportunities quietly among qualified buyers.',
      'To be one of those buyers, three things need to be in order before you make contact: proof of funds, a clear brief, and a decision-making process that can move in days rather than weeks.',
      'Proof of funds is simple but non-negotiable — a recent statement or a lender’s letter. A clear brief means knowing your non-negotiables and your flexibilities: location radius, minimum bedrooms, whether you will renovate.',
      'Finally, decide in advance who signs. Private sales collapse most often not on price but on a buyer who cannot get an answer from a co-owner or trustee quickly enough.',
    ],
  },
  {
    slug: 'material-honesty',
    title: 'On Material Honesty',
    category: 'Interiors',
    date: '2024-09-12',
    readingTime: '5 min',
    image: IMAGES.journal[2],
    excerpt:
      'Why the studio leaves concrete unpainted, timber unstained and steel exposed — and where that principle has limits.',
    body: [
      'Material honesty is the idea that a surface should read as what it is. Concrete looks like concrete. Oak looks like oak. Nothing pretends to be something more expensive or more permanent than it actually is.',
      'In practice this simplifies detailing. There are no cover strips hiding a change of material, because the change is the detail. Junctions are designed to be seen.',
      'It also ages well. A painted wall records every knock; a raw plaster wall absorbs them into its character. Brass left unlacquered darkens into something no finish could imitate.',
      'The limit is comfort. Honesty stops at the point where a material makes a room cold, loud or hard to live in — and there, a quiet intervention is the honest choice.',
    ],
  },
  {
    slug: 'small-footprint-homes',
    title: 'Designing the Small-Footprint Home',
    category: 'Residential',
    date: '2024-08-04',
    readingTime: '7 min',
    image: IMAGES.journal[3],
    excerpt:
      'Constraint is a design tool. Lessons from a series of compact residences where every square metre had to earn its place.',
    body: [
      'A small house is not a large house with rooms removed. It is a different problem, and the studio approaches it by designing sections before plans — thinking vertically about where light, storage and height belong.',
      'Built-in furniture does the heavy lifting. A single joinery wall can hold a kitchen, a desk, a wardrobe and a staircase if it is planned from the outset rather than fitted later.',
      'Sightlines matter more than floor area. A compact home feels generous when you can see through it — from the entrance to a garden, from the kitchen to the sky.',
      'And restraint in materials keeps a small space calm: one floor finish throughout, one timber, one stone. The eye reads continuity as space.',
    ],
  },
];

export const postBySlug = (slug) => JOURNAL.find((p) => p.slug === slug);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
