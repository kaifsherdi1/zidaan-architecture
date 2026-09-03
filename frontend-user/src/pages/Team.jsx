import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { IMAGES } from '../data/images';
import { TEAM, LEADERSHIP } from '../data/team';

export default function Team() {
  const rest = TEAM.filter((m) => !LEADERSHIP.some((l) => l.id === m.id));

  return (
    <Layout>
      <PageHero
        image={IMAGES.hero.team}
        eyebrow="The Studio"
        title={<>The<br />team</>}
        intro="A group of architects, designers and advisors across India, united by a belief in spatial clarity."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Team' }]}
      />

      {/* Leadership */}
      <section className="section-padding bg-white">
        <div className="section-container">
          <Reveal>
            <span className="eyebrow">Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-14">
              Partners &amp; directors
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
            {LEADERSHIP.map((m, i) => (
              <Reveal key={m.id} delay={i * 90}>
                <Link to={`/team/${m.id}`} className="group block">
                  <div className="image-zoom-container aspect-[4/5] mb-6 grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={m.image} alt={m.name} loading="lazy" className="w-full h-full object-cover image-zoom" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-[0.14em]">{m.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mt-1.5">{m.role}</p>
                  <p className="mt-4 text-sm text-secondary font-light leading-relaxed line-clamp-3">{m.bio}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Full roster */}
      <section className="section-padding bg-background-off">
        <div className="section-container">
          <Reveal>
            <span className="eyebrow">Specialists</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-14">The wider studio</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
            {rest.map((m, i) => (
              <Reveal key={m.id} delay={(i % 4) * 70}>
                <div className="group">
                  <Link to={`/team/${m.id}`} className="block">
                    <div className="image-zoom-container aspect-[3/4] mb-4 grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img src={m.image} alt={m.name} loading="lazy" className="w-full h-full object-cover image-zoom" />
                    </div>
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.14em]">{m.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-black/40 mt-1">{m.role}</p>
                  </Link>
                  <a
                    href={`mailto:${m.email}`}
                    className="mt-3 inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Email ${m.name}`}
                  >
                    <Mail size={14} />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Careers CTA */}
      <section className="section-padding-sm bg-white">
        <div className="section-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 border-t border-black/10 pt-16">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">Work with us</h2>
            <p className="mt-3 text-secondary font-light max-w-md">
              We hire for curiosity and craft. Open roles are posted on the careers page.
            </p>
          </div>
          <Link to="/careers">
            <Button variant="minimal">View open roles</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
