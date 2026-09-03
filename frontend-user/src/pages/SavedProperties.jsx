import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import AccountNav from '../components/AccountNav';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import PropertyTile from '../components/PropertyTile';
import api from '../services/api';

export default function SavedProperties() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    api
      .getSavedProperties()
      .then(({ data }) => setItems(data.data || data || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <Layout>
      <PageHero
        eyebrow="Your account"
        title={<>Saved<br />properties</>}
        intro="Everything you have bookmarked, ready to revisit or share with the studio."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Account', to: '/dashboard' }, { label: 'Saved' }]}
      />

      <section className="section-padding-sm bg-white">
        <div className="section-container">
          <AccountNav />

          {items === null ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-[11px] uppercase tracking-[0.3em] text-secondary animate-pulse">
                Loading…
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="border border-black/10 py-20 text-center">
              <h3 className="text-2xl font-bold uppercase tracking-tight text-black/25 mb-6">
                Nothing saved yet
              </h3>
              <p className="text-sm text-secondary font-light mb-8 max-w-sm mx-auto">
                Tap the heart on any listing to keep it here.
              </p>
              <Link to="/properties">
                <Button variant="minimal">Browse properties</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {items.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 70}>
                  <PropertyTile property={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
