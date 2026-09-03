import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import { IMAGES } from '../data/images';
import { JOURNAL, formatDate } from '../data/journal';

const CATEGORIES = ['All', ...Array.from(new Set(JOURNAL.map((p) => p.category)))];

export default function Journal() {
  const [cat, setCat] = useState('All');
  const posts = cat === 'All' ? JOURNAL : JOURNAL.filter((p) => p.category === cat);
  const [featured, ...rest] = posts;

  return (
    <Layout>
      <PageHero
        image={IMAGES.hero.journal}
        eyebrow="Journal"
        title={<>Notes on space,<br />material &amp; property</>}
        intro="Essays and observations from the studio — on how buildings are designed, bought and lived in."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Journal' }]}
      />

      <section className="section-padding bg-white">
        <div className="section-container">
          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-14">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-4 py-2 border transition-colors ${
                  cat === c ? 'bg-black text-white border-black' : 'border-black/20 text-black/50 hover:border-black'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {featured && (
            <Reveal className="mb-20">
              <Link to={`/journal/${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
                <div className="image-zoom-container aspect-[4/3]">
                  <img src={featured.image} alt={featured.title} className="w-full h-full object-cover image-zoom" />
                </div>
                <div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40 mb-4">
                    <span>{featured.category}</span>
                    <span>·</span>
                    <span>{formatDate(featured.date)}</span>
                    <span>·</span>
                    <span>{featured.readingTime}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-[1.05] mb-5 group-hover:text-secondary transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-secondary font-light leading-relaxed max-w-md">{featured.excerpt}</p>
                  <span className="mt-6 inline-block link-underline text-[11px] uppercase tracking-[0.24em] font-bold">
                    Read article
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 border-t border-black/10 pt-16">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 70}>
                <Link to={`/journal/${post.slug}`} className="group block">
                  <div className="image-zoom-container aspect-[4/3] mb-5">
                    <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover image-zoom" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-[0.06em] leading-snug mb-2 group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-secondary font-light leading-relaxed line-clamp-2">{post.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
