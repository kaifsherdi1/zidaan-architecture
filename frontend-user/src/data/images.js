// Central registry for all local imagery.
// Files live in /public/images and are served from the site root.
const img = (name) => `/images/${name}.jpg`;

// Home hero background video (Pexels, free license). Two encodes so mobile
// never pulls the full 1080p file — see <source media> in components/HeroVideo.
export const VIDEOS = {
  home: {
    sm: '/videos/hero-home-sm.mp4', // 1280x720, ~1.7MB
    lg: '/videos/hero-home.mp4', // 1920x1080, ~3.6MB
  },
};

export const IMAGES = {
  hero: {
    home: img('hero-home'),
    works: img('hero-works'),
    about: img('hero-about'),
    contact: img('hero-contact'),
    services: img('hero-services'),
    team: img('hero-team'),
    journal: img('hero-journal'),
    careers: img('hero-careers'),
  },
  ctaWide: img('cta-wide'),
  about: {
    story: img('about-story'),
    studio: img('about-studio'),
    philosophy: img('philosophy'),
  },
  interiors: [img('interior-1'), img('interior-2'), img('interior-3')],
  properties: [
    img('property-1'), img('property-2'), img('property-3'), img('property-4'),
    img('property-5'), img('property-6'), img('property-7'), img('property-8'),
  ],
  services: {
    buy: img('service-buy'),
    sell: img('service-sell'),
    rent: img('service-rent'),
    manage: img('service-manage'),
    design: img('service-design'),
  },
  journal: [img('journal-1'), img('journal-2'), img('journal-3'), img('journal-4')],
  team: [
    img('team-1'), img('team-2'), img('team-3'), img('team-4'),
    img('team-5'), img('team-6'), img('team-7'), img('team-8'),
  ],
};

// Deterministic fallback so a missing API image never breaks a layout.
export const propertyFallback = (seed = 0) =>
  IMAGES.properties[Math.abs(seed) % IMAGES.properties.length];

export const teamFallback = (seed = 0) =>
  IMAGES.team[Math.abs(seed) % IMAGES.team.length];

export default IMAGES;
