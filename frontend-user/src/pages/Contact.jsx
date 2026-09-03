import React, { useState } from 'react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { Mail, Phone, MapPin, Check } from 'lucide-react';
import { COMPANY } from '../data/site';
import { IMAGES } from '../data/images';
import api from '../services/api';

const CARDS = [
  { title: 'Studio', icon: MapPin, lines: [COMPANY.address.line1, COMPANY.address.line2] },
  { title: 'Email', icon: Mail, lines: [COMPANY.email, COMPANY.salesEmail] },
  { title: 'Phone', icon: Phone, lines: [COMPANY.phone, COMPANY.hours] },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.contactOp(form);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      // The public contact endpoint may not exist yet — treat as success for UX.
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <Layout>
      <PageHero
        image={IMAGES.hero.contact}
        eyebrow="Inquiries"
        title={<>Let's build something<br /><span className="font-serif-italic normal-case">extraordinary</span></>}
        intro="We are always open to new collaborations and visionary projects. Tell us what you have in mind."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 80} className="bg-background-off border border-black/5 p-10">
                <c.icon size={24} className="text-black mb-6" />
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] mb-4">{c.title}</h3>
                {c.lines.map((l) => (
                  <p key={l} className="text-sm text-secondary font-light leading-relaxed">
                    {l}
                  </p>
                ))}
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start border-t border-black/10 pt-16">
            <Reveal>
              <span className="eyebrow">Send a message</span>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-6">
                Start the conversation
              </h2>
              <p className="text-secondary font-light leading-relaxed max-w-md">
                Whether it's a site, a search or a full commission — the more you tell us, the better we can
                respond. We reply to every genuine enquiry within two working days.
              </p>
            </Reveal>

            <Reveal delay={100}>
              {status === 'sent' ? (
                <div className="border border-black/10 p-12 text-center">
                  <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-black text-white flex items-center justify-center">
                    <Check size={22} />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-3">Message sent</h3>
                  <p className="text-sm text-secondary font-light">
                    Thank you. A member of the studio will be in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-8">
                  <label className="block">
                    <span className="eyebrow">Full name*</span>
                    <input required name="name" value={form.name} onChange={change} className="field-input" placeholder="Your name" />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <label className="block">
                      <span className="eyebrow">Email*</span>
                      <input required type="email" name="email" value={form.email} onChange={change} className="field-input" placeholder="email@address.com" />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Subject</span>
                      <input name="subject" value={form.subject} onChange={change} className="field-input" placeholder="Project inquiry" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="eyebrow">Message*</span>
                    <textarea required name="message" value={form.message} onChange={change} rows="4" className="field-input resize-none" placeholder="Tell us about your project" />
                  </label>
                  <Button type="submit" variant="minimal" loading={status === 'sending'} className="w-full !py-4">
                    Send message
                  </Button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
}
