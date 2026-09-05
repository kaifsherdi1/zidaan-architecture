import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, MapPin, Check } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import PropertyTile from '../components/PropertyTile';
import api from '../services/api';
import { useStateContext } from '../contexts/ContextProvider';
import { allPropertyImages, priceLabel, propertyLocation } from '../utils/property';

export default function PropertyDetails() {
  const { id } = useParams();
  const { token } = useStateContext();
  const [property, setProperty] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [booking, setBooking] = useState({ date: '', time: '', message: '' });
  const [bookingState, setBookingState] = useState('idle');

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    api
      .getProperty(id)
      .then(({ data }) => {
        setProperty(data.data);
        setActive(0);
        return api.getProperties({ status: 'available', per_page: 7 });
      })
      .then(({ data }) => setRelated((data.data || []).filter((p) => String(p.id) !== String(id)).slice(0, 3)))
      .catch((err) => console.error('Failed to fetch property', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-5">
          <div className="w-16 h-px bg-black/10 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.4em] text-secondary animate-pulse">
            Building context…
          </span>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center flex-col gap-8">
          <h1 className="text-3xl font-bold uppercase tracking-tight">Project not found</h1>
          <Link to="/properties">
            <Button variant="minimal">Return to gallery</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const images = allPropertyImages(property);
  const move = (dir) => setActive((prev) => (prev + dir + images.length) % images.length);

  const isShop = property.category === 'shop';
  const specs = [
    { label: property.type === 'rent' ? 'Rent' : 'Price', value: priceLabel(property) },
    { label: 'Type', value: property.category_label || (property.type === 'rent' ? 'For rent' : 'For sale') },
    { label: 'Location', value: propertyLocation(property) },
    { label: isShop ? 'Carpet area' : 'Built-up area', value: property.area ? `${Number(property.area).toLocaleString('en-IN')} sq ft` : '—' },
    ...(isShop
      ? []
      : [
          { label: 'Bedrooms', value: property.bedrooms ?? '—' },
          { label: 'Bathrooms', value: property.bathrooms ?? '—' },
        ]),
    { label: 'Covered parking', value: property.garages ? `${property.garages} cars` : '—' },
    {
      label: 'Status',
      value:
        property.status === 'sold'
          ? 'Sold'
          : property.status === 'rented'
          ? 'Let'
          : property.type === 'rent'
          ? 'Available to let'
          : 'Available',
    },
  ];

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!token) {
      setBookingState('auth');
      return;
    }
    setBookingState('sending');
    try {
      await api.createBooking({
        property_id: property.id,
        visit_date: booking.date,
        visit_time: booking.time,
        message: booking.message,
      });
      setBookingState('sent');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.visit_date?.[0];
      setBookingState(msg || 'error');
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[78vh] sm:h-[85vh] w-full overflow-hidden">
        <img src={images[active]} alt={property.title} className="w-full h-full object-cover" />
        <button
          className="absolute inset-0 w-full h-full"
          onClick={() => setLightbox(true)}
          aria-label="Open gallery"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        <div className="absolute bottom-8 sm:bottom-12 left-0 right-0 section-container z-10 flex items-end justify-between gap-6">
          <div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/80 hover:text-white transition-colors mb-6"
            >
              <ChevronLeft size={14} /> Gallery
            </Link>
            <span className="block text-[10px] uppercase tracking-[0.3em] text-white/60 mb-2">
              {[
                property.category_label,
                property.type === 'rent' ? 'For rent' : 'For sale',
                property.location?.city,
              ]
                .filter(Boolean)
                .join(' · ')}
            </span>
            <h1 className="text-white font-bold uppercase tracking-tighter leading-[0.95] text-3xl sm:text-5xl lg:text-7xl">
              {property.title}
            </h1>
          </div>
          {images.length > 1 && (
            <div className="hidden sm:flex gap-3 shrink-0">
              <button
                onClick={() => move(-1)}
                className="w-11 h-11 border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => move(1)}
                className="w-11 h-11 border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Narrative + specs */}
      <section className="section-padding bg-white">
        <div className="section-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <Reveal className="lg:col-span-8">
            <span className="eyebrow">Overview</span>
            <p className="text-xl sm:text-2xl lg:text-3xl font-light italic text-black leading-relaxed mb-10 break-words">
              "{(property.description || '').split('.')[0] || property.title}."
            </p>
            <div className="space-y-5 text-secondary font-light leading-relaxed">
              {(property.description || 'Full details available on request.')
                .split('\n')
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>

            {Array.isArray(property.features) && property.features.length > 0 && (
              <div className="mt-12 pt-10 border-t border-black/10">
                <span className="eyebrow">Features</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {property.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-secondary font-light">
                      <Check size={15} className="mt-0.5 shrink-0 text-black" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>

          <Reveal className="lg:col-span-4" delay={100}>
            <div className="lg:sticky lg:top-28 bg-background-off border border-black/5 p-8">
              <span className="eyebrow">Specifications</span>
              <dl className="space-y-4">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between items-baseline border-b border-black/5 pb-3">
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-black/45">{s.label}</dt>
                    <dd className="text-sm font-bold uppercase tracking-[0.06em] text-right">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <a href="#inquire" className="mt-8 block">
                <Button variant="minimal" className="w-full !py-3">
                  Request a viewing
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery grid */}
      {images.length > 1 && (
        <section className="pb-24 bg-white">
          <div className="section-container grid grid-cols-1 sm:grid-cols-2 gap-6">
            {images.slice(1).map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setActive(i + 1);
                  setLightbox(true);
                }}
                className={`image-zoom-container ${i % 3 === 0 ? 'sm:col-span-2 aspect-video' : 'aspect-square'} group`}
              >
                <img src={img} alt={`${property.title} ${i + 2}`} loading="lazy" className="w-full h-full object-cover image-zoom" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Inquiry */}
      <section id="inquire" className="section-padding bg-background-off border-t border-black/10">
        <div className="section-container max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="eyebrow mx-auto w-fit">Inquiry</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-4">
              Arrange a private viewing
            </h2>
            <p className="text-secondary font-light">
              Tell us when suits and our team will confirm by email.
            </p>
          </div>

          {bookingState === 'sent' ? (
            <div className="bg-white border border-black/10 p-12 text-center">
              <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-black text-white flex items-center justify-center">
                <Check size={22} />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight mb-3">Request sent</h3>
              <p className="text-sm text-secondary font-light">We'll be in touch shortly to confirm a time.</p>
            </div>
          ) : (
            <form onSubmit={submitBooking} className="bg-white border border-black/10 p-8 sm:p-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <label className="block">
                <span className="eyebrow">Preferred date</span>
                <input
                  type="date"
                  required
                  min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                  value={booking.date}
                  onChange={(e) => setBooking((b) => ({ ...b, date: e.target.value }))}
                  className="field-input"
                />
              </label>
              <label className="block">
                <span className="eyebrow">Preferred time</span>
                <input
                  type="time"
                  required
                  value={booking.time}
                  onChange={(e) => setBooking((b) => ({ ...b, time: e.target.value }))}
                  className="field-input"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="eyebrow">Message</span>
                <textarea
                  rows="3"
                  value={booking.message}
                  onChange={(e) => setBooking((b) => ({ ...b, message: e.target.value }))}
                  className="field-input resize-none"
                  placeholder="Anything we should know"
                />
              </label>
              {bookingState === 'auth' && (
                <p className="sm:col-span-2 text-[12px] text-black/60 leading-relaxed">
                  Please <Link to="/login" className="underline">log in</Link> or{' '}
                  <Link to="/register" className="underline">create an account</Link> to request a viewing.
                </p>
              )}
              {!['idle', 'sending', 'sent', 'auth'].includes(bookingState) && (
                <p className="sm:col-span-2 text-[12px] text-red-600">
                  {bookingState === 'error' ? 'Something went wrong. Please try again.' : bookingState}
                </p>
              )}
              <Button
                type="submit"
                variant="minimal"
                loading={bookingState === 'sending'}
                className="sm:col-span-2 !py-4"
              >
                Schedule viewing
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="section-padding bg-white">
          <div className="section-container">
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">More works</h2>
              <Link to="/properties" className="link-underline text-[11px] uppercase tracking-[0.24em] font-bold">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 70}>
                  <PropertyTile property={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <button onClick={() => setLightbox(false)} className="absolute top-6 right-6 text-white z-10" aria-label="Close">
            <X size={30} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={() => move(-1)}
                className="absolute left-4 sm:left-8 text-white/70 hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={() => move(1)}
                className="absolute right-4 sm:right-8 text-white/70 hover:text-white"
                aria-label="Next"
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}
          <img src={images[active]} alt={property.title} className="max-h-[88vh] max-w-[92vw] object-contain" />
          <span className="absolute bottom-6 text-white/50 text-[11px] uppercase tracking-[0.3em]">
            {active + 1} / {images.length}
          </span>
        </div>
      )}
    </Layout>
  );
}
