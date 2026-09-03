import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, MessageSquare, ArrowRight, Home as HomeIcon } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import AccountNav from '../components/AccountNav';
import { useStateContext } from '../contexts/ContextProvider';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useStateContext();
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    api
      .getUserBookings()
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]));
  }, []);

  const cards = [
    {
      icon: Calendar,
      title: 'Viewings',
      desc: 'Upcoming property viewings and consultations.',
      to: '/my-bookings',
      cta: 'View schedule',
      stat: bookings ? String(bookings.length) : '—',
    },
    {
      icon: Heart,
      title: 'Saved',
      desc: 'Properties you have bookmarked for later.',
      to: '/saved',
      cta: 'Open saved',
    },
    {
      icon: MessageSquare,
      title: 'Messages',
      desc: 'Direct communication with the Zidaan team.',
      to: '/contact',
      cta: 'Contact studio',
    },
  ];

  return (
    <Layout>
      <PageHero
        eyebrow="Your account"
        title={<>Welcome back,<br />{(user?.name || 'Member').split(' ')[0]}</>}
        intro="Manage your viewings, saved properties and profile in one place."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Account' }]}
      />

      <section className="section-padding-sm bg-white">
        <div className="section-container">
          <AccountNav />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((c, i) => (
              <Link
                key={c.title}
                to={c.to}
                className="group border border-black/10 p-8 flex flex-col justify-between min-h-[220px] hover:border-black transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <c.icon size={26} className="text-black/30" />
                    {c.stat && <span className="text-3xl font-bold tracking-tighter">{c.stat}</span>}
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] mb-3">{c.title}</h3>
                  <p className="text-xs text-secondary font-light leading-relaxed">{c.desc}</p>
                </div>
                <span className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
                  {c.cta}
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-14 border border-black/10 p-8 sm:p-10">
            <span className="eyebrow">Recent activity</span>
            {bookings && bookings.length > 0 ? (
              <ul className="divide-y divide-black/5">
                {bookings.slice(0, 4).map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-4 gap-4">
                    <span className="text-sm text-black/70 font-light truncate">
                      Viewing request · {b.property?.title || 'Property'}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 shrink-0">
                      {b.status || 'pending'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <p className="text-sm text-secondary font-light italic">
                  No activity yet — start by exploring the portfolio.
                </p>
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold"
                >
                  <HomeIcon size={14} /> Browse properties
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
