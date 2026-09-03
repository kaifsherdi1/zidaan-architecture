import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { IMAGES } from '../data/images';
import { STATS, COMPANY } from '../data/site';
import { LEADERSHIP } from '../data/team';

const VALUES = [
  { title: 'Pure Forms', desc: 'Reducing architectural elements to their most essential expression.' },
  { title: 'Honest Materials', desc: 'Celebrating the raw beauty of stone, timber, concrete and glass.' },
  { title: 'Natural Light', desc: 'Using light as a primary building material to sculpt interior volumes.' },
  { title: 'Emotional Depth', desc: 'Designing spaces that evoke stillness, contemplation and wonder.' },
];

export default function About() {
  return (
    <Layout>
      <PageHero
        image={IMAGES.hero.about}
        eyebrow="The Vision"
        title={<>The poetry<br />of space</>}
        intro="Zidaan Architectures is a boutique studio and real-estate practice creating high-end environments that transcend functional requirements."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      {/* Statement */}
      <section className="section-padding bg-white">
        <div className="section-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow">Est. {COMPANY.established}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[1.05]">
              Luxury lies
              <br />
              <span className="font-serif-italic normal-case text-secondary">in simplicity</span>
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-7 space-y-6 text-secondary font-light text-base sm:text-lg leading-relaxed" delay={100}>
            <p>
              Founded in {COMPANY.established}, the studio was established with a singular focus: to redefine
              high-end residential and commercial architecture through the lens of minimalism and emotional
              resonance.
            </p>
            <p>
              We approach each project as a dialogue between the client's aspirations, the site's inherent
              character, and the timeless principles of light and form. We do not follow trends — we seek to
              create enduring architecture that stays relevant for generations.
            </p>
            <p>
              Alongside the design practice, our real-estate team advises private and institutional clients on
              buying, selling and managing exceptional property.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Image band */}
      <section className="h-[52vh] sm:h-[70vh] w-full overflow-hidden">
        <img src={IMAGES.about.studio} alt="Inside the studio" className="w-full h-full object-cover" />
      </section>

      {/* Stats */}
      <section className="section-padding-sm bg-black text-white">
        <div className="section-container grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold tracking-tighter mb-3">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/50">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Approach / values */}
      <section className="section-padding bg-white">
        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
          <Reveal>
            <span className="eyebrow">Our Approach</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-8">Four principles</h2>
            <p className="text-secondary font-light leading-relaxed max-w-md">
              They are not a style. They are the questions we ask of every drawing, every material sample and
              every site visit.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 70} className="bg-background-off p-8 border border-black/5">
                <h4 className="text-sm font-bold uppercase tracking-[0.16em] mb-4">{v.title}</h4>
                <p className="text-xs text-secondary leading-loose font-light">{v.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership teaser */}
      <section className="section-padding bg-background-off">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-14">
            <div>
              <span className="eyebrow">The Studio</span>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight">Leadership</h2>
            </div>
            <Link to="/team" className="link-underline text-[11px] uppercase tracking-[0.24em] font-bold">
              Meet the full team
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {LEADERSHIP.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <Link to={`/team/${m.id}`} className="group block">
                  <div className="image-zoom-container aspect-[4/5] mb-5 grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={m.image} alt={m.name} loading="lazy" className="w-full h-full object-cover image-zoom" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em]">{m.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mt-1">{m.role}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative h-[46vh] sm:h-[56vh] w-full overflow-hidden flex items-center">
        <img src={IMAGES.ctaWide} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="section-container relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-8">
            Let's build something enduring
          </h2>
          <Link to="/contact">
            <Button variant="minimal-light">Start a conversation</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
