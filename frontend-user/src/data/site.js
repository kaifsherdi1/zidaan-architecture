// Single source of truth for company-wide content used across pages / footer / nav.

export const LOGO = {
  icon: '/images/zidaan-logo-icon.png',       // trimmed building emblem (transparent)
  horizontal: '/images/zidaan-logo-h.png',    // emblem + wordmark, single row — for the nav bar
  full: '/images/zidaan-logo-full.png',       // full stacked lockup + tagline (transparent)
};

export const COMPANY = {
  name: 'Zidaan Architectures',
  shortName: 'Zidaan',
  tagline: 'Studio of Architecture & Design',
  established: 2024,
  description:
    'An architecture, design and real-estate studio working across India on high-end residential and commercial environments. We believe in the poetry of space and the power of minimal design.',
  email: 'hello@zidaan.com',
  salesEmail: 'sales@zidaan.com',
  careersEmail: 'careers@zidaan.com',
  phone: '+91 22 4890 1200',
  phoneHref: 'tel:+912248901200',
  address: {
    line1: 'Kalpataru Prime, 4th Floor, Prabhadevi',
    line2: 'Mumbai, Maharashtra 400025',
  },
  hours: 'Mon – Sat · 10:00 – 19:00 IST',
};

export const SOCIALS = [
  { name: 'Instagram', href: 'https://instagram.com', icon: 'Instagram' },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: 'Linkedin' },
  { name: 'Facebook', href: 'https://facebook.com', icon: 'Facebook' },
  { name: 'Twitter', href: 'https://twitter.com', icon: 'Twitter' },
];

// Primary navigation. `children` renders a dropdown on desktop / a group on mobile.
export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  {
    name: 'Properties',
    path: '/properties',
    children: [
      { name: 'All Listings', path: '/properties' },
      { name: 'Buy', path: '/buy' },
      { name: 'Rent', path: '/rent' },
      { name: 'Sell Your Property', path: '/sell' },
      { name: 'Apartments', path: '/properties?category=apartment' },
      { name: 'Shops & Retail', path: '/properties?category=shop' },
      { name: 'Single Floor Homes', path: '/properties?category=single_floor' },
      { name: 'Duplex Homes', path: '/properties?category=duplex' },
      { name: 'Double Floor Homes', path: '/properties?category=double_floor' },
      { name: 'Third Floor Homes', path: '/properties?category=third_floor' },
    ],
  },
  { name: 'Services', path: '/services' },
  {
    name: 'Studio',
    path: '/about',
    children: [
      { name: 'About', path: '/about' },
      { name: 'Team', path: '/team' },
      { name: 'Agents', path: '/agents' },
      { name: 'Careers', path: '/careers' },
    ],
  },
  { name: 'Journal', path: '/journal' },
  { name: 'Contact', path: '/contact' },
];

export const FOOTER_NAV = [
  {
    title: 'Explore',
    links: [
      { name: 'All Listings', path: '/properties' },
      { name: 'Buy', path: '/buy' },
      { name: 'Rent', path: '/rent' },
      { name: 'Sell', path: '/sell' },
      { name: 'Services', path: '/services' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { name: 'About', path: '/about' },
      { name: 'Team', path: '/team' },
      { name: 'Agents', path: '/agents' },
      { name: 'Journal', path: '/journal' },
      { name: 'Careers', path: '/careers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Contact', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Use', path: '/terms' },
    ],
  },
];

export const STATS = [
  { value: '250+', label: 'Projects Delivered' },
  { value: '14', label: 'Cities across India' },
  { value: '₹9,500 Cr+', label: 'Property Transacted' },
  { value: '40', label: 'Specialists' },
];
