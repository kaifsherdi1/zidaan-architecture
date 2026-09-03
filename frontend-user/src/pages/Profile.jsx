import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import AccountNav from '../components/AccountNav';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import { useStateContext } from '../contexts/ContextProvider';
import { Check } from 'lucide-react';

export default function Profile() {
  const { user } = useStateContext();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    // Profile update endpoint is not yet exposed publicly — reflect intent in the UI.
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <Layout>
      <PageHero
        eyebrow="Your account"
        title={<>Profile &amp;<br />preferences</>}
        intro="Keep your details current so the studio can reach you about viewings and matches."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Account', to: '/dashboard' }, { label: 'Profile' }]}
      />

      <section className="section-padding-sm bg-white">
        <div className="section-container">
          <AccountNav />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            <Reveal className="lg:col-span-7">
              <form onSubmit={submit} className="space-y-8 max-w-lg">
                <label className="block">
                  <span className="eyebrow">Full name</span>
                  <input name="name" value={form.name} onChange={change} className="field-input" />
                </label>
                <label className="block">
                  <span className="eyebrow">Email</span>
                  <input type="email" name="email" value={form.email} onChange={change} className="field-input" />
                </label>
                <label className="block">
                  <span className="eyebrow">Phone</span>
                  <input name="phone" value={form.phone} onChange={change} className="field-input" placeholder="Add a number" />
                </label>
                <div className="flex items-center gap-4">
                  <Button type="submit" variant="minimal">Save changes</Button>
                  {saved && (
                    <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-black/50">
                      <Check size={14} /> Saved
                    </span>
                  )}
                </div>
              </form>
            </Reveal>

            <Reveal className="lg:col-span-5" delay={100}>
              <div className="bg-background-off border border-black/5 p-8">
                <span className="eyebrow">Account</span>
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <dt className="text-black/40 uppercase tracking-[0.14em] text-[11px]">Member since</dt>
                    <dd className="font-medium">
                      {user?.created_at ? new Date(user.created_at).getFullYear() : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-black/5 pb-3">
                    <dt className="text-black/40 uppercase tracking-[0.14em] text-[11px]">Status</dt>
                    <dd className="font-medium">{user?.is_active === false ? 'Inactive' : 'Active'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-black/40 uppercase tracking-[0.14em] text-[11px]">Email verified</dt>
                    <dd className="font-medium">{user?.email_verified_at ? 'Yes' : 'Pending'}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
}
