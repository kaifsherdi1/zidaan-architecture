import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import AccountNav from '../components/AccountNav';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import api from '../services/api';
import { propertyFallback } from '../data/images';

const STATUS_STYLES = {
  pending: 'bg-black/5 text-black',
  approved: 'bg-black text-white',
  confirmed: 'bg-black text-white',
  rejected: 'border border-black/20 text-black/50',
  cancelled: 'border border-black/20 text-black/50',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState(null);

  const load = () => {
    api
      .getUserBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]));
  };

  useEffect(load, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this viewing request?')) return;
    try {
      await api.cancelBooking(id);
    } catch {
      /* optimistic */
    }
    setBookings((bs) => bs.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
  };

  return (
    <Layout>
      <PageHero
        eyebrow="Your account"
        title={<>Property<br />viewings</>}
        intro="Your requested viewings and their status. We confirm times by email."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Account', to: '/dashboard' }, { label: 'Viewings' }]}
      />

      <section className="section-padding-sm bg-white">
        <div className="section-container">
          <AccountNav />

          {bookings === null ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-[11px] uppercase tracking-[0.3em] text-secondary animate-pulse">Loading…</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="border border-black/10 py-20 text-center">
              <h3 className="text-2xl font-bold uppercase tracking-tight text-black/25 mb-6">
                No viewings booked
              </h3>
              <p className="text-sm text-secondary font-light mb-8 max-w-sm mx-auto">
                Request a viewing from any property page.
              </p>
              <Link to="/properties">
                <Button variant="minimal">Browse properties</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings.map((b, i) => {
                const p = b.property || {};
                const date = b.formatted_date || b.visit_date;
                return (
                  <Reveal key={b.id} delay={(i % 3) * 60} className="border border-black/10">
                    <div className="relative aspect-[4/3] bg-background-off">
                      <img
                        src={p.image || p.main_image || propertyFallback(p.id || i)}
                        alt={p.title || 'Property'}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 px-3 py-1 text-[9px] uppercase tracking-[0.16em] font-bold ${
                          STATUS_STYLES[b.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {b.status || 'pending'}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-sm font-bold uppercase tracking-[0.14em] mb-2 truncate">
                        {p.title || 'Property'}
                      </h3>
                      {(p.address || p.city) && (
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-black/45 mb-4">
                          <MapPin size={12} />
                          <span className="truncate">{p.address || p.city}</span>
                        </div>
                      )}
                      {date && (
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-black/60 border-t border-black/5 pt-4">
                          <Calendar size={13} /> {date}
                          {b.formatted_time ? ` · ${b.formatted_time}` : ''}
                        </div>
                      )}
                      {['pending', 'approved', 'confirmed'].includes(b.status) && (
                        <button
                          onClick={() => cancel(b.id)}
                          className="mt-5 w-full border border-black/15 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white transition-colors"
                        >
                          Cancel request
                        </button>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
