import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import PropertyTile from '../components/PropertyTile';
import { IMAGES } from '../data/images';
import api from '../services/api';

const STEPS = [
  { step: '01', title: 'Valuation', desc: 'A free, no-obligation appraisal based on real comparable evidence.' },
  { step: '02', title: 'Presentation', desc: 'Architectural photography, floor plans and staging direction.' },
  { step: '03', title: 'Campaign', desc: 'A targeted release to our vetted buyer network and, if you wish, the open market.' },
  { step: '04', title: 'Close', desc: 'Offer negotiation and conveyancing managed to completion.' },
];

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  address: '',
  type: 'House',
  bedrooms: '',
  price: '',
  message: '',
};

export default function SellProperty() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [sold, setSold] = useState([]);

  useEffect(() => {
    api
      .getProperties({ type: 'sale', status: 'sold', per_page: 6 })
      .then(({ data }) => setSold(data.data || []))
      .catch(() => setSold([]));
  }, []);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.contactOp({ ...form, subject: 'Sell enquiry' });
    } catch {
      /* endpoint optional */
    }
    setStatus('sent');
    setForm(EMPTY);
  };

  return (
    <Layout>
      <PageHero
        image={IMAGES.services.sell}
        eyebrow="Sell"
        title={<>Present your property<br />at its best</>}
        intro="Positioning, photography and a qualified buyer network — with transparent reporting from first day to close."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Properties', to: '/properties' }, { label: 'Sell' }]}
      />

      <section className="section-padding bg-white">
        <div className="section-container grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
          {/* Process */}
          <Reveal className="lg:col-span-5">
            <span className="eyebrow">The process</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-12">Four steps</h2>
            <div className="space-y-8">
              {STEPS.map((s) => (
                <div key={s.step} className="flex gap-6 border-t border-black/10 pt-5">
                  <span className="text-2xl font-bold tracking-tighter text-black/30">{s.step}</span>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.16em] mb-2">{s.title}</h3>
                    <p className="text-sm text-secondary font-light leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Form */}
          <Reveal className="lg:col-span-7" delay={100}>
            <div className="bg-background-off border border-black/5 p-8 sm:p-12">
              {status === 'sent' ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-black text-white flex items-center justify-center">
                    <Check size={22} />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-3">Request received</h3>
                  <p className="text-sm text-secondary font-light max-w-sm mx-auto">
                    Thank you. We'll be in touch within one working day to arrange your valuation.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-7">
                  <span className="eyebrow">Request a valuation</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    <label className="block">
                      <span className="eyebrow">Full name*</span>
                      <input required name="name" value={form.name} onChange={change} className="field-input" />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Email*</span>
                      <input required type="email" name="email" value={form.email} onChange={change} className="field-input" />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Phone</span>
                      <input name="phone" value={form.phone} onChange={change} className="field-input" />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Property type</span>
                      <select name="type" value={form.type} onChange={change} className="field-input">
                        <option>House</option>
                        <option>Apartment</option>
                        <option>Villa</option>
                        <option>Commercial</option>
                        <option>Land</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="eyebrow">Property address*</span>
                    <input required name="address" value={form.address} onChange={change} className="field-input" />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                    <label className="block">
                      <span className="eyebrow">Bedrooms</span>
                      <input type="number" name="bedrooms" value={form.bedrooms} onChange={change} className="field-input" />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Guide price</span>
                      <input type="number" name="price" value={form.price} onChange={change} className="field-input" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="eyebrow">Anything else</span>
                    <textarea name="message" value={form.message} onChange={change} rows="3" className="field-input resize-none" />
                  </label>
                  <Button type="submit" variant="minimal" loading={status === 'sending'} className="w-full !py-4">
                    Request valuation
                  </Button>
                  <p className="text-[11px] text-black/40 leading-relaxed">
                    By submitting you agree to our{' '}
                    <Link to="/privacy" className="underline">privacy policy</Link>. No obligation, no fee for
                    the valuation itself.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Recently sold */}
      {sold.length > 0 && (
        <section className="section-padding bg-background-off border-t border-black/10">
          <div className="section-container">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
              <div>
                <span className="eyebrow">Track record</span>
                <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                  Recently sold
                </h2>
              </div>
              <p className="text-sm text-secondary font-light max-w-sm">
                A sample of homes placed with buyers from our private network across India —
                most within weeks of release.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {sold.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 70}>
                  <PropertyTile property={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
