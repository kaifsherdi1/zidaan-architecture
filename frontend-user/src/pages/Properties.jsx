import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import PropertyTile from '../components/PropertyTile';
import api from '../services/api';
import { IMAGES } from '../data/images';
import { CATEGORIES, CATEGORY_BY_SLUG } from '../data/categories';

const EMPTY_FILTERS = { location: '', minPrice: '', maxPrice: '' };

const PRESETS = {
  sale: {
    eyebrow: 'Buy',
    title: (
      <>
        Homes
        <br />
        for sale
      </>
    ),
    intro:
      'A curated selection of residences and investment assets. Every listing is vetted, disclosed and advisory-backed.',
    crumb: 'Buy',
  },
  rent: {
    eyebrow: 'Rent',
    title: (
      <>
        Homes
        <br />
        for rent
      </>
    ),
    intro: 'Long and short-term rentals across the managed portfolio — verified, documented and ready to view.',
    crumb: 'Rent',
  },
};

export default function Properties({ preset }) {
  const cfg = preset && PRESETS[preset];
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('category') || '';
  const catCfg = CATEGORY_BY_SLUG[activeCat];

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const fetchProperties = useCallback(
    async (f = filters) => {
      setLoading(true);
      try {
        const query = { per_page: 60 };
        if (preset) {
          query.type = preset;
          query.status = 'available';
        }
        if (activeCat) query.category = activeCat;
        if (f.location) query.city = f.location;
        if (f.minPrice) query.min_price = f.minPrice;
        if (f.maxPrice) query.max_price = f.maxPrice;
        const { data } = await api.getProperties(query);
        setProperties(data.data || []);
      } catch (error) {
        console.error('Failed to fetch properties', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, preset, activeCat]
  );

  useEffect(() => {
    fetchProperties(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, activeCat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const setCategory = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setSearchParams(next);
  };

  const apply = () => {
    fetchProperties();
    setShowFilters(false);
  };

  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setCategory('');
    fetchProperties(EMPTY_FILTERS);
  };

  const breadcrumb = [
    { label: 'Home', to: '/' },
    { label: 'Properties', to: '/properties' },
  ];
  if (cfg) breadcrumb.push({ label: cfg.crumb });
  else if (catCfg) breadcrumb.push({ label: catCfg.plural });

  return (
    <Layout>
      {cfg ? (
        <PageHero
          image={IMAGES.hero.works}
          eyebrow={cfg.eyebrow}
          title={cfg.title}
          intro={cfg.intro}
          breadcrumb={breadcrumb}
        />
      ) : catCfg ? (
        <PageHero
          image={catCfg.image}
          eyebrow="Properties"
          title={catCfg.plural}
          intro={catCfg.blurb}
          breadcrumb={breadcrumb}
        />
      ) : (
        <PageHero
          eyebrow="Portfolio"
          title={
            <>
              Selected
              <br />
              works
            </>
          }
          intro="Every listing across our managed portfolio — filter by type, city or budget to narrow it down."
          breadcrumb={breadcrumb}
        />
      )}

      {/* Browse by type */}
      <section className="section-container pt-14 sm:pt-20">
        <div className="flex items-baseline justify-between mb-6">
          <span className="eyebrow !mb-0">Browse by type</span>
          {activeCat && (
            <button
              onClick={() => setCategory('')}
              className="text-[11px] uppercase tracking-[0.2em] text-black/45 hover:text-black transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((c) => {
            const isActive = activeCat === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => setCategory(isActive ? '' : c.slug)}
                className={`group relative aspect-[4/5] overflow-hidden border transition-colors ${
                  isActive ? 'border-black' : 'border-black/10 hover:border-black/40'
                }`}
              >
                <img
                  src={c.image}
                  alt={c.plural}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span
                  className={`absolute left-0 right-0 bottom-0 p-2.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] leading-tight ${
                    isActive ? 'text-white' : 'text-white/90'
                  }`}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-y border-black/10 mt-14 sm:mt-20">
        <div className="section-container flex items-center justify-between py-4">
          <span className="text-[11px] uppercase tracking-[0.2em] text-black/50">
            {loading
              ? 'Loading…'
              : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}${
                  catCfg ? ` · ${catCfg.plural}` : ''
                }`}
          </span>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] font-bold hover:opacity-60 transition-opacity"
          >
            {showFilters ? <X size={15} /> : <SlidersHorizontal size={15} />}
            {showFilters ? 'Close' : 'Filter'}
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 cubic-bezier ${
            showFilters ? 'max-h-[560px] border-t border-black/10' : 'max-h-0'
          }`}
        >
          <div className="section-container py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-background-off">
            <label className="block">
              <span className="eyebrow">City</span>
              <input
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="field-input"
              />
            </label>
            <label className="block">
              <span className="eyebrow">Type</span>
              <select
                value={activeCat}
                onChange={(e) => setCategory(e.target.value)}
                className="field-input"
              >
                <option value="">All types</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.plural}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="eyebrow">Min price (₹)</span>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="0"
                className="field-input"
              />
            </label>
            <label className="block">
              <span className="eyebrow">Max price (₹)</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="Any"
                className="field-input"
              />
            </label>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-4">
              <Button onClick={apply} variant="minimal" className="!py-3">
                Apply filters
              </Button>
              <button
                onClick={reset}
                className="text-[11px] uppercase tracking-[0.2em] px-4 hover:text-black text-black/50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="section-padding">
        <div className="section-container">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-5">
              <div className="w-12 h-px bg-black/10 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-secondary animate-pulse">
                Loading properties…
              </span>
            </div>
          ) : properties.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center gap-6">
              <h3 className="text-2xl font-bold uppercase tracking-tight text-black/25">No matching properties</h3>
              <button onClick={reset} className="text-[11px] uppercase tracking-[0.2em] underline underline-offset-8">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {properties.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 70}>
                  <PropertyTile property={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-sm bg-background-off">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight mb-6">
            Not seeing it? <span className="font-serif-italic normal-case text-secondary">Tell us what you want.</span>
          </h2>
          <p className="text-secondary font-light max-w-xl mx-auto mb-9">
            Many of our best opportunities never reach a public listing. Share your brief and we'll come back with
            options.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button variant="minimal">Register your brief</Button>
            </Link>
            <Link to="/sell">
              <Button variant="link">Sell a property</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
