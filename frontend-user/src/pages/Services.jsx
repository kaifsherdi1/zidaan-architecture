import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { IMAGES } from '../data/images';
import { SERVICES, PROCESS } from '../data/services';

export default function Services() {
  return (
    <Layout>
      <PageHero
        image={IMAGES.hero.services}
        eyebrow="What we do"
        title={<>One studio,<br />end to end</>}
        intro="Find a home, sell one, rent one, or design one from the ground up — handled by a single team with a single standard."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      />

      <section className="section-padding bg-white">
        <div className="section-container space-y-24 lg:space-y-32">
          {SERVICES.map((s, i) => (
            <Reveal
              key={s.slug}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
            >
              <div
                className={`image-zoom-container aspect-[4/3] ${
                  i % 2 === 1 ? 'lg:order-2' : ''
                }`}
              >
                <img src={s.image} alt={s.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="eyebrow">0{i + 1}</span>
                <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-5">{s.title}</h2>
                <p className="text-secondary font-light leading-relaxed mb-8 max-w-md">{s.summary}</p>
                <ul className="space-y-3 mb-9">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-black/70 font-light">
                      <Check size={16} className="mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={s.cta.to}
                  className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] font-bold"
                >
                  {s.cta.label}
                  <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-black text-white">
        <div className="section-container">
          <Reveal>
            <span className="eyebrow-light">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-16">A clear path</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 80} className="border-t border-white/20 pt-6">
                <div className="text-3xl font-bold tracking-tighter text-white/40 mb-4">{p.step}</div>
                <h3 className="text-sm font-bold uppercase tracking-[0.16em] mb-3">{p.title}</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">{p.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding-sm bg-white">
        <div className="section-container text-center">
          <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight mb-8">
            Not sure where to start?
          </h2>
          <Link to="/contact">
            <Button variant="minimal">Book a consultation</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
