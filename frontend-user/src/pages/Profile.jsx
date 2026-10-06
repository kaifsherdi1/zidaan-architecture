import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import AccountNav from '../components/AccountNav';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import PasswordInput from '../components/ui/PasswordInput';
import { useStateContext } from '../contexts/ContextProvider';
import api from '../services/api';
import { apiError } from '../utils/errors';
import { isValidPassword, passwordChecks, PASSWORD_RULES } from '../utils/validation';
import { Check } from 'lucide-react';

const EMPTY_PW = { current_password: '', password: '', password_confirmation: '' };

function Notice({ kind, children }) {
  if (!children) return null;
  return kind === 'error' ? (
    <p role="alert" className="border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-3">{children}</p>
  ) : (
    <p role="status" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-black/60">
      <Check size={14} /> {children}
    </p>
  );
}

export default function Profile() {
  const { user, setUser } = useStateContext();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  const [pw, setPw] = useState(EMPTY_PW);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ kind: '', text: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const changePw = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ kind: '', text: '' });
    try {
      const { data } = await api.updateProfile({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      });
      setUser(data.data);
      setMsg({ kind: 'ok', text: 'Saved' });
    } catch (err) {
      setMsg({ kind: 'error', text: apiError(err, 'Your details could not be saved.') });
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwMsg({ kind: '', text: '' });
    if (!isValidPassword(pw.password)) {
      setPwMsg({ kind: 'error', text: 'Your new password does not meet the rules below.' });
      return;
    }
    if (pw.password !== pw.password_confirmation) {
      setPwMsg({ kind: 'error', text: 'The two new passwords do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      await api.updateProfile(pw);
      setPw(EMPTY_PW);
      setPwMsg({ kind: 'ok', text: 'Password changed — other devices were signed out' });
    } catch (err) {
      setPwMsg({ kind: 'error', text: apiError(err, 'Your password could not be changed.') });
    } finally {
      setPwSaving(false);
    }
  };

  const checks = passwordChecks(pw.password);

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
            <Reveal className="lg:col-span-7 space-y-16">
              <form onSubmit={submit} className="space-y-8 max-w-lg" noValidate>
                <Notice kind={msg.kind === 'error' ? 'error' : null}>{msg.kind === 'error' && msg.text}</Notice>
                <label className="block">
                  <span className="eyebrow">Full name</span>
                  <input name="name" required maxLength={255} autoComplete="name" value={form.name} onChange={change} className="field-input" />
                </label>
                <label className="block">
                  <span className="eyebrow">Email</span>
                  <input type="email" name="email" autoComplete="email" value={form.email} onChange={change} className="field-input" placeholder="Add an email address" />
                </label>
                <label className="block">
                  <span className="eyebrow">Phone</span>
                  <input type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={change} className="field-input" placeholder="Add a number" />
                </label>
                <div className="flex items-center gap-4">
                  <Button type="submit" variant="minimal" loading={saving}>Save changes</Button>
                  {msg.kind === 'ok' && <Notice kind="ok">{msg.text}</Notice>}
                </div>
              </form>

              <form onSubmit={submitPassword} className="space-y-6 max-w-lg" noValidate>
                <span className="eyebrow">Change password</span>
                <Notice kind={pwMsg.kind === 'error' ? 'error' : null}>{pwMsg.kind === 'error' && pwMsg.text}</Notice>
                <PasswordInput label="Current password" name="current_password" value={pw.current_password} onChange={changePw} autoComplete="current-password" />
                <PasswordInput label="New password" name="password" value={pw.password} onChange={changePw} autoComplete="new-password" />
                <PasswordInput label="Confirm new password" name="password_confirmation" value={pw.password_confirmation} onChange={changePw} autoComplete="new-password" />
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] tracking-wide">
                  {PASSWORD_RULES.map((r) => (
                    <li key={r.key} className={checks[r.key] ? 'text-black' : 'text-black/35'}>
                      {checks[r.key] ? '✓' : '·'} {r.label}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-4">
                  <Button type="submit" variant="minimal" loading={pwSaving}>Update password</Button>
                  {pwMsg.kind === 'ok' && <Notice kind="ok">{pwMsg.text}</Notice>}
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
                    <dt className="text-black/40 uppercase tracking-[0.14em] text-[11px]">Sign-in</dt>
                    <dd className="font-medium">{user?.email ? 'Email' : user?.phone ? 'Phone' : '—'}</dd>
                  </div>
                </dl>
                <p className="mt-6 text-xs text-black/45 leading-relaxed">
                  To close your account, contact the studio — we will remove your details and any open viewing requests.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
}
