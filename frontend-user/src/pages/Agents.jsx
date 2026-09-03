import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mail, Phone, ArrowUpRight } from 'lucide-react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import Reveal from '../components/ui/Reveal';
import api from '../services/api';
import { teamFallback } from '../data/images';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');

  const fetchAgents = (search = '') => {
    setLoading(true);
    api
      .getAgents({ search })
      .then(({ data }) => setAgents(data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <Layout>
      <PageHero
        eyebrow="Advisory"
        title={<>Our<br />agents</>}
        intro="The people who represent our listings and guide clients through every transaction — discreet, senior and accountable."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Agents' }]}
        actions={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAgents(term);
            }}
            className="relative w-full max-w-sm"
          >
            <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by name"
              className="w-full bg-transparent border-b border-black/15 pl-7 py-2.5 text-sm outline-none focus:border-black transition-colors"
            />
          </form>
        }
      />

      <section className="section-padding pt-4 bg-white">
        <div className="section-container">
          {loading ? (
            <div className="h-80 flex flex-col items-center justify-center gap-5">
              <div className="w-12 h-px bg-black/10 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-secondary animate-pulse">
                Loading directory…
              </span>
            </div>
          ) : agents.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-5">
              <h3 className="text-2xl font-bold uppercase tracking-tight text-black/25">No agents found</h3>
              <button
                onClick={() => {
                  setTerm('');
                  fetchAgents();
                }}
                className="text-[11px] uppercase tracking-[0.2em] underline underline-offset-8"
              >
                Reset search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {agents.map((agent, i) => (
                <Reveal key={agent.id} delay={(i % 4) * 60} className="group">
                  <Link to={`/agents/${agent.id}`} className="block">
                    <div className="image-zoom-container aspect-[3/4] mb-5 grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img
                        src={agent.profile_image || agent.image || teamFallback(agent.id || i)}
                        alt={agent.name}
                        loading="lazy"
                        className="w-full h-full object-cover image-zoom"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.14em]">{agent.name}</h3>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-black/40 mt-1">
                          {agent.title || 'Real Estate Agent'}
                        </p>
                      </div>
                      <ArrowUpRight size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                  <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {agent.email && (
                      <a href={`mailto:${agent.email}`} aria-label="Email" className="text-black/50 hover:text-black">
                        <Mail size={14} />
                      </a>
                    )}
                    {agent.phone && (
                      <a href={`tel:${agent.phone}`} aria-label="Call" className="text-black/50 hover:text-black">
                        <Phone size={14} />
                      </a>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
