import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import PropertyTile from '../components/PropertyTile';
import api from '../services/api';
import { teamFallback } from '../data/images';

export default function AgentDetail() {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await api.getAgent(id);
        if (active) {
          setAgent(data.data || data);
          setState('ready');
        }
      } catch {
        // Fall back to the list endpoint if there is no single-agent route.
        try {
          const { data } = await api.getAgents();
          const found = (data.data || []).find((a) => String(a.id) === String(id));
          if (active) {
            setAgent(found || null);
            setState(found ? 'ready' : 'missing');
          }
        } catch {
          if (active) setState('missing');
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (state === 'loading') {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-secondary animate-pulse">Loading…</span>
        </div>
      </Layout>
    );
  }

  if (state === 'missing' || !agent) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
          <h1 className="text-3xl font-bold uppercase tracking-tight">Agent not found</h1>
          <Link to="/agents">
            <Button variant="minimal">Back to agents</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const listings = agent.properties || agent.listings || [];

  return (
    <Layout>
      <section className="pt-36 sm:pt-44 pb-16 bg-white">
        <div className="section-container">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-black/50 hover:text-black transition-colors mb-12"
          >
            <ArrowLeft size={14} /> All agents
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <Reveal className="lg:col-span-5">
              <div className="image-zoom-container aspect-[4/5] bg-background-off">
                <img
                  src={agent.profile_image || agent.image || teamFallback(agent.id || 0)}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={100}>
              <span className="eyebrow">{agent.title || 'Real Estate Agent'}</span>
              <h1 className="text-4xl sm:text-6xl font-bold uppercase tracking-tighter leading-[0.95] mb-6">
                {agent.name}
              </h1>
              <div className="flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.18em] text-black/50 mb-10">
                {agent.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={13} /> {agent.location}
                  </span>
                )}
                {agent.email && (
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-black transition-colors">
                    <Mail size={13} /> {agent.email}
                  </a>
                )}
                {agent.phone && (
                  <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-black transition-colors">
                    <Phone size={13} /> {agent.phone}
                  </a>
                )}
              </div>

              <p className="text-lg font-light text-secondary leading-relaxed mb-10 max-w-xl">
                {agent.bio ||
                  `${agent.name} advises private and institutional clients across the studio's managed portfolio, from first viewing through to completion.`}
              </p>

              <Link to="/contact">
                <Button variant="minimal">Enquire via {agent.name.split(' ')[0]}</Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {listings.length > 0 && (
        <section className="section-padding bg-background-off">
          <div className="section-container">
            <span className="eyebrow">Represented by {agent.name.split(' ')[0]}</span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-12">Current listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {listings.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 70}>
                  <PropertyTile property={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
