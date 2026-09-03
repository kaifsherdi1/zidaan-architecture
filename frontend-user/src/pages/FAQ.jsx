import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';

const GROUPS = [
  {
    title: 'Buying & Renting',
    items: [
      {
        q: 'Do I need to register to view a property?',
        a: 'Browsing is open to everyone. To request a private viewing or make an offer you will need a free account so we can keep your enquiries and documents in one place.',
      },
      {
        q: 'Are all listings shown on the site?',
        a: 'No. A number of our opportunities are handled privately at the seller’s request. Register your brief on the contact page and we will share matches directly.',
      },
      {
        q: 'How are viewings arranged?',
        a: 'Once you request a viewing, the assigned agent confirms a time slot with you by email, usually within one working day.',
      },
    ],
  },
  {
    title: 'Selling & Management',
    items: [
      {
        q: 'What does it cost to list with Zidaan?',
        a: 'We work on a success fee agreed up front, with no charge for the initial valuation, photography direction or campaign planning.',
      },
      {
        q: 'Do you manage rental properties?',
        a: 'Yes. Our property management service covers maintenance, tenancy, rent collection, compliance and owner reporting end to end.',
      },
    ],
  },
  {
    title: 'Design Studio',
    items: [
      {
        q: 'Can I commission the studio for a renovation only?',
        a: 'Absolutely. We take on renovations, extensions and interior-only commissions alongside ground-up architecture.',
      },
      {
        q: 'Do you work internationally?',
        a: 'We do. The studio operates across 18 countries, partnering with local architects of record where required.',
      },
    ],
  },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-6 py-6 text-left"
      >
        <span className="text-base sm:text-lg font-bold uppercase tracking-tight">{q}</span>
        <span className="shrink-0 mt-1 text-black/60">{open ? <Minus size={18} /> : <Plus size={18} />}</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60 pb-6' : 'max-h-0'}`}>
        <p className="text-sm sm:text-base text-secondary font-light leading-relaxed max-w-2xl">{a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <Layout>
      <PageHero
        eyebrow="Support"
        title={<>Frequently asked<br />questions</>}
        intro="The things people ask us most, grouped by what you're here to do."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]}
      />

      <section className="section-padding bg-white">
        <div className="section-container max-w-4xl space-y-16">
          {GROUPS.map((g, i) => (
            <Reveal key={g.title} delay={i * 60}>
              <h2 className="text-xs uppercase tracking-[0.24em] text-black/40 mb-4">{g.title}</h2>
              <div>
                {g.items.map((it) => (
                  <Item key={it.q} {...it} />
                ))}
              </div>
            </Reveal>
          ))}

          <div className="bg-background-off p-10 text-center">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Still have a question?</h3>
            <p className="text-secondary font-light mb-6">Our team is happy to help.</p>
            <Link to="/contact" className="link-underline text-[11px] uppercase tracking-[0.24em] font-bold">
              Contact the studio
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
