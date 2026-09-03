import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Mail, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { TEAM, teamMemberById } from '../data/team';

export default function TeamMember() {
  const { id } = useParams();
  const member = teamMemberById(id);

  if (!member) return <Navigate to="/team" replace />;

  const idx = TEAM.findIndex((m) => m.id === id);
  const next = TEAM[(idx + 1) % TEAM.length];

  return (
    <Layout>
      <section className="pt-36 sm:pt-44 pb-16 bg-white">
        <div className="section-container">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-black/50 hover:text-black transition-colors mb-12"
          >
            <ArrowLeft size={14} /> All team
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <Reveal className="lg:col-span-5">
              <div className="image-zoom-container aspect-[4/5] bg-background-off">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={100}>
              <span className="eyebrow">{member.role}</span>
              <h1 className="text-4xl sm:text-6xl font-bold uppercase tracking-tighter leading-[0.95] mb-6">
                {member.name}
              </h1>
              <div className="flex flex-wrap gap-6 text-[11px] uppercase tracking-[0.18em] text-black/50 mb-10">
                <span className="flex items-center gap-2">
                  <MapPin size={13} /> {member.location}
                </span>
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-black transition-colors">
                  <Mail size={13} /> {member.email}
                </a>
              </div>

              <p className="text-lg font-light text-secondary leading-relaxed mb-10 max-w-xl">{member.bio}</p>

              <div className="border-t border-black/10 pt-8">
                <span className="eyebrow">Focus areas</span>
                <div className="flex flex-wrap gap-3">
                  {member.expertise.map((e) => (
                    <span
                      key={e}
                      className="text-[10px] uppercase tracking-[0.16em] font-bold border border-black/80 px-3 py-1.5"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-padding-sm bg-background-off">
        <div className="section-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <span className="eyebrow">Next</span>
            <Link
              to={`/team/${next.id}`}
              className="text-2xl sm:text-3xl font-bold uppercase tracking-tight link-underline"
            >
              {next.name}
            </Link>
          </div>
          <Link to="/contact">
            <Button variant="minimal">
              Work with {member.name.split(' ')[0]} <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
