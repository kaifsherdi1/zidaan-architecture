import React from 'react';
import Layout from '../components/Layout';
import { Heading, Text } from '../components/ui/Typography';
import Button from '../components/ui/Button';
import { useStateContext } from '../contexts/ContextProvider';
import { Calendar, Home, MessageSquare, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useStateContext();

  return (
    <Layout>
      <section className="pt-40 pb-20 bg-white">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="max-w-2xl">
              <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">
                Studio Member
              </span>
              <Heading level={1} className="mb-8">
                Member<br />Dashboard
              </Heading>
              <Text className="text-secondary font-light">
                Welcome back, {user?.name || 'Member'}. Manage your inquiries and architectural consultations here.
              </Text>
            </div>

            <div className="flex gap-4">
              <Link to="/properties">
                <Button variant="minimal" className="!px-6 !py-2 !text-[10px]">Explore Projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

            {/* Stats / Quick Info */}
            <div className="bg-background-off p-10 border border-black/5 flex flex-col justify-between aspect-square">
              <div>
                <Calendar className="text-black/20 mb-6" size={32} />
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Bookings</h3>
                <Text className="text-xs text-secondary font-light">See your upcoming property viewings and consultations.</Text>
              </div>
              <Link to="/properties" className="group flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mt-10">
                View Schedule <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="bg-background-off p-10 border border-black/5 flex flex-col justify-between aspect-square">
              <div>
                <Home className="text-black/20 mb-6" size={32} />
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Saved Projects</h3>
                <Text className="text-xs text-secondary font-light">Access the architectural works you've bookmarked.</Text>
              </div>
              <Link to="/properties" className="group flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mt-10">
                Explore Saved <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="bg-background-off p-10 border border-black/5 flex flex-col justify-between aspect-square">
              <div>
                <MessageSquare className="text-black/20 mb-6" size={32} />
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Messages</h3>
                <Text className="text-xs text-secondary font-light">Direct communication with the Zidaan studio team.</Text>
              </div>
              <Link to="/contact" className="group flex items-center justify-between text-[10px] uppercase tracking-widest font-bold mt-10">
                Contact Studio <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

          </div>

          <div className="mt-20 p-12 bg-white border border-black/5">
            <Heading level={4} className="mb-10 !text-xs !tracking-[0.3em]">Recent Activity</Heading>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-black/5">
                <span className="text-xs font-light text-secondary italic">Welcome to the new Zidaan Architectures experience.</span>
                <span className="text-[10px] uppercase tracking-widest text-black/20">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
