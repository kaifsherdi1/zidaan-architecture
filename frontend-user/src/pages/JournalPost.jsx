import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Reveal from '../components/ui/Reveal';
import { JOURNAL, postBySlug, formatDate } from '../data/journal';

export default function JournalPost() {
  const { slug } = useParams();
  const post = postBySlug(slug);

  if (!post) return <Navigate to="/journal" replace />;

  const idx = JOURNAL.findIndex((p) => p.slug === slug);
  const next = JOURNAL[(idx + 1) % JOURNAL.length];

  return (
    <Layout>
      <article>
        <header className="pt-36 sm:pt-44 pb-12 bg-white">
          <div className="section-container max-w-3xl">
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-black/50 hover:text-black transition-colors mb-10"
            >
              <ArrowLeft size={14} /> Journal
            </Link>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-black/40 mb-6">
              <span>{post.category}</span>
              <span>·</span>
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-[0.98]">
              {post.title}
            </h1>
          </div>
        </header>

        <div className="h-[46vh] sm:h-[64vh] w-full overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div className="section-padding bg-white">
          <div className="section-container max-w-2xl">
            <p className="text-xl sm:text-2xl font-light italic text-secondary leading-relaxed mb-12">
              {post.excerpt}
            </p>
            <div className="space-y-7 text-black/75 font-light text-base sm:text-lg leading-relaxed">
              {post.body.map((para, i) => (
                <Reveal key={i} as="p" delay={i * 40}>
                  {para}
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <section className="section-padding-sm bg-background-off">
          <div className="section-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="eyebrow">Next article</span>
              <Link
                to={`/journal/${next.slug}`}
                className="text-2xl sm:text-3xl font-bold uppercase tracking-tight link-underline"
              >
                {next.title}
              </Link>
            </div>
            <Link
              to={`/journal/${next.slug}`}
              className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] font-bold"
            >
              Continue reading
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </section>
      </article>
    </Layout>
  );
}
