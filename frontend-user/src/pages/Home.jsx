import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import PropertyTile from '../components/PropertyTile';
import HeroVideo from '../components/HeroVideo';
import api from '../services/api';
import { IMAGES, VIDEOS } from '../data/images';
import { COMPANY, STATS } from '../data/site';
import { SERVICES } from '../data/services';
import { JOURNAL, formatDate } from '../data/journal';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProperties({ status: 'available', featured: 1, per_page: 6 })
      .then(({ data }) => setProperties(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[100svh] w-full overflow-hidden flex items-center">
        <HeroVideo sources={VIDEOS.home} poster={IMAGES.hero.home} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />

        <div className="section-container relative z-10 pt-24">
          <span className="eyebrow-light animate-fade-in">{COMPANY.tagline}</span>
          <h1 className="text-white font-bold uppercase tracking-tighter leading-[0.92] text-[2rem] xs:text-4xl sm:text-6xl lg:text-8xl animate-slide-up">
            Zidaan
            <br />
            Architectures
          </h1>
          <div className="mt-10 flex flex-col sm:flex-row gap-6 sm:items-center animate-fade-in">
            <Link to="/properties">
              <Button variant="minimal-light">View Selected Works</Button>
            </Link>
            <p className="text-white/60 text-xs uppercase tracking-[0.22em] leading-loose max-w-xs">
              Redefining spaces with minimalist poetry and architectural precision.
            </p>
          </div>
        </div>

        <div className="absolute right-6 bottom-24 hidden xl:block">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 rotate-90 origin-right whitespace-nowrap">
            Est. {COMPANY.established} — Global Studio
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-white">
        <div className="section-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow">Philosophy</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[1.05] mb-8">
              The essence
              <br />
              <span className="font-serif-italic normal-case text-secondary">of space</span>
            </h2>
            <p className="text-lg sm:text-xl font-light italic text-secondary mb-8 leading-relaxed">
              "Architecture is not about building boxes; it's about choreographing the interaction between
              light, material and human emotion."
            </p>
            <p className="text-black/70 font-light leading-relaxed mb-10 max-w-md">
              {COMPANY.name} is a boutique studio dedicated to high-end environments that transcend function.
              Our belief is simple: luxury lies in restraint.
            </p>
            <Link to="/about" className="link-underline text-[11px] uppercase tracking-[0.24em] font-bold">
              Read our story
            </Link>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={120}>
            <div className="image-zoom-container aspect-[4/5] lg:aspect-[3/2]">
              <img
                src={IMAGES.about.philosophy}
                alt="Architecture studio interior"
                className="w-full h-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Selected works */}
      <section className="section-padding bg-background-off">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-14">
            <div>
              <span className="eyebrow">Portfolio</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[1]">
                Selected
                <br />
                works
              </h2>
            </div>
            <Link
              to="/properties"
              className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] font-bold"
            >
              View all projects
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="text-[11px] uppercase tracking-[0.3em] text-secondary animate-pulse">
                Fetching projects…
              </span>
            </div>
          ) : properties.length === 0 ? (
            <p className="text-sm text-secondary uppercase tracking-[0.2em]">
              No projects published yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {properties.slice(0, 6).map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 80}>
                  <PropertyTile property={p} ratio="aspect-[3/4]" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full-width visual */}
      <section className="h-[52vh] sm:h-[70vh] w-full overflow-hidden">
        <img src={IMAGES.interiors[0]} alt="Architectural detail" className="w-full h-full object-cover" />
      </section>

      {/* Services */}
      <section className="section-padding bg-white">
        <div className="section-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <Reveal className="lg:col-span-4">
            <span className="eyebrow">What we do</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-6">Services</h2>
            <p className="text-secondary font-light leading-relaxed mb-8">
              From finding a home to designing one — a single studio across the full life of a property.
            </p>
            <Link to="/services" className="link-underline text-[11px] uppercase tracking-[0.24em] font-bold">
              Explore all services
            </Link>
          </Reveal>
          <div className="lg:col-span-8 divide-y divide-black/10 border-t border-black/10">
            {SERVICES.map((s, i) => (
              <Reveal
                key={s.slug}
                delay={i * 50}
                as={Link}
                to="/services"
                className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <h4 className="text-xl sm:text-2xl font-bold uppercase tracking-tight group-hover:text-secondary transition-colors">
                  {s.title}
                </h4>
                <p className="md:max-w-sm text-sm text-secondary font-light leading-relaxed">
                  {s.summary}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
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

      {/* Journal */}
      <section className="section-padding bg-background-off">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-14">
            <div>
              <span className="eyebrow">Journal</span>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight">Latest thinking</h2>
            </div>
            <Link to="/journal" className="link-underline text-[11px] uppercase tracking-[0.24em] font-bold">
              All articles
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {JOURNAL.slice(0, 3).map((post, i) => (
              <Reveal key={post.slug} delay={i * 80}>
                <Link to={`/journal/${post.slug}`} className="group block">
                  <div className="image-zoom-container aspect-[4/3] mb-5">
                    <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover image-zoom" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-[0.06em] leading-snug group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding bg-white">
        <div className="section-container max-w-5xl mx-auto text-center">
          <span className="eyebrow mx-auto w-fit">Get in touch</span>
          <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight mb-8">
            Ready to evolve
            <br />
            your vision?
          </h2>
          <p className="text-secondary font-light max-w-xl mx-auto mb-10">
            We are always looking for visionary clients to collaborate with on exceptional projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button variant="minimal">Send an inquiry</Button>
            </Link>
            <Link to="/properties">
              <Button variant="link">Browse listings</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
