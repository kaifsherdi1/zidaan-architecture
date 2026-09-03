import React from 'react';
import Layout from './Layout';
import PageHero from './PageHero';

export default function LegalPage({ title, updated, sections }) {
  return (
    <Layout>
      <PageHero
        eyebrow="Legal"
        title={title}
        intro={`Last updated ${updated}.`}
        breadcrumb={[{ label: 'Home', to: '/' }, { label: title }]}
      />

      <section className="section-padding bg-white">
        <div className="section-container max-w-2xl space-y-12">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-bold uppercase tracking-tight mb-4">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-sm sm:text-base text-secondary font-light leading-relaxed mb-4">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
