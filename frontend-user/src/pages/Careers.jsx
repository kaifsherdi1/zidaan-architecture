import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import { IMAGES } from '../data/images';
import { COMPANY } from '../data/site';

const ROLES = [
  { title: 'Senior Architect', location: 'Los Angeles', type: 'Full-time', team: 'Design' },
  { title: 'Project Architect', location: 'London', type: 'Full-time', team: 'Delivery' },
  { title: 'Interior Designer', location: 'Dubai', type: 'Full-time', team: 'Interiors' },
  { title: 'Real Estate Advisor', location: 'New York', type: 'Full-time', team: 'Real Estate' },
  { title: 'Architectural Visualiser', location: 'Remote', type: 'Contract', team: 'Visualisation' },
  { title: 'Studio Coordinator', location: 'Los Angeles', type: 'Part-time', team: 'Operations' },
];

const BENEFITS = [
  { title: 'Ownership', desc: 'You lead your projects — from first sketch to handover — with real authorship.' },
  { title: 'Craft time', desc: 'Protected studio days for research, prototyping and material study.' },
  { title: 'Global exposure', desc: 'Projects across 18 countries and secondments between our city studios.' },
  { title: 'Wellbeing', desc: 'Sensible hours, generous leave and full health cover for you and family.' },
];

export default function Careers() {
  return (
    <Layout>
      <PageHero
        image={IMAGES.hero.careers}
        eyebrow="Careers"
        title={<>Build a practice,<br />not just a portfolio</>}
        intro="We hire for curiosity and craft, then give people room to do the best work of their careers."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Careers' }]}
      />

      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-24">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 70} className="border-t border-black/10 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] mb-3">{b.title}</h3>
                <p className="text-sm text-secondary font-light leading-relaxed">{b.desc}</p>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <span className="eyebrow">Open roles</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-10">Currently hiring</h2>
          </Reveal>

          <div className="border-t border-black/10">
            {ROLES.map((r, i) => (
              <Reveal
                key={r.title}
                delay={i * 40}
                as="a"
                href={`mailto:${COMPANY.careersEmail}?subject=Application: ${encodeURIComponent(r.title)}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-7 border-b border-black/10"
              >
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight group-hover:text-secondary transition-colors">
                    {r.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-[11px] uppercase tracking-[0.16em] text-black/45">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} /> {r.location}
                    </span>
                    <span>{r.type}</span>
                    <span>{r.team}</span>
                  </div>
                </div>
                <ArrowRight
                  size={20}
                  className="shrink-0 group-hover:translate-x-1.5 transition-transform"
                />
              </Reveal>
            ))}
          </div>

          <div className="mt-16 bg-background-off p-10 text-center">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Don't see your role?</h3>
            <p className="text-secondary font-light mb-6 max-w-md mx-auto">
              We always want to hear from exceptional architects and designers. Send a portfolio and a note.
            </p>
            <a
              href={`mailto:${COMPANY.careersEmail}`}
              className="link-underline text-[11px] uppercase tracking-[0.24em] font-bold"
            >
              {COMPANY.careersEmail}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
