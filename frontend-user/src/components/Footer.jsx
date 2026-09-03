import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, ArrowRight, Check } from 'lucide-react';
import { COMPANY, FOOTER_NAV, SOCIALS, LOGO } from '../data/site';

const ICONS = { Facebook, Twitter, Instagram, Linkedin };

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <footer className="bg-white border-t border-black/10">
      <div className="section-container py-16 sm:py-24">
        {/* Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-16 border-b border-black/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-tight">
              Join the studio
              <br />
              mailing list
            </h2>
            <p className="mt-4 text-sm text-secondary font-light max-w-sm">
              New listings, project releases and the occasional essay. No noise.
            </p>
          </div>
          <form onSubmit={submit} className="flex flex-col justify-end">
            <label htmlFor="footer-email" className="eyebrow">
              Email address
            </label>
            <div className="flex items-center border-b border-black/20 focus-within:border-black transition-colors">
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-black/25"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="p-2 text-black hover:translate-x-1 transition-transform"
              >
                {sent ? <Check size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
            {sent && (
              <span className="mt-3 text-[11px] uppercase tracking-[0.2em] text-black/50">
                Thank you — you’re on the list.
              </span>
            )}
          </form>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block" aria-label={COMPANY.name}>
              <img src={LOGO.full} alt={COMPANY.name} className="h-20 w-auto" />
            </Link>
            <p className="mt-6 text-sm text-secondary font-light leading-relaxed max-w-xs">
              {COMPANY.description}
            </p>
            <div className="flex gap-5 mt-8">
              {SOCIALS.map((s) => {
                const Icon = ICONS[s.icon];
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="text-black/60 hover:text-black transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-black mb-6">
                {col.title}
              </h3>
              <ul className="space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="text-[13px] uppercase tracking-[0.14em] text-secondary hover:text-black transition-colors"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 border-t border-black/10">
          <div>
            <span className="eyebrow">Studio</span>
            <p className="text-sm text-secondary font-light">
              {COMPANY.address.line1}
              <br />
              {COMPANY.address.line2}
            </p>
          </div>
          <div>
            <span className="eyebrow">Enquiries</span>
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-sm text-secondary font-light hover:text-black transition-colors"
            >
              {COMPANY.email}
            </a>
            <br />
            <a
              href={COMPANY.phoneHref}
              className="text-sm text-secondary font-light hover:text-black transition-colors"
            >
              {COMPANY.phone}
            </a>
          </div>
          <div>
            <span className="eyebrow">Hours</span>
            <p className="text-sm text-secondary font-light">{COMPANY.hours}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-10 border-t border-black/10 text-[10px] uppercase tracking-[0.2em] text-secondary">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
            <Link to="/faq" className="hover:text-black transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
