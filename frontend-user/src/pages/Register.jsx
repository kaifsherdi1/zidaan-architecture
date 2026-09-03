import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import PasswordInput from '../components/ui/PasswordInput';
import SocialAuth from '../components/auth/SocialAuth';
import { Heading, Text } from '../components/ui/Typography';
import api from '../services/api';
import { useStateContext } from '../contexts/ContextProvider';
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  passwordChecks,
  PASSWORD_RULES,
} from '../utils/validation';

const METHODS = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
];

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken, setNotification } = useStateContext();

  const [method, setMethod] = useState('email');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const checks = useMemo(() => passwordChecks(form.password), [form.password]);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name';

    if (method === 'email') {
      if (!form.email.trim()) next.email = 'Please enter your email address';
      else if (!isValidEmail(form.email)) next.email = 'Enter a valid email, e.g. name@example.com';
    } else {
      if (!form.phone.trim()) next.phone = 'Please enter your phone number';
      else if (!isValidPhone(form.phone)) next.phone = 'Enter a valid phone number, e.g. +91 98765 43210';
    }

    if (!isValidPassword(form.password)) next.password = 'Password does not meet the requirements below';
    else if (form.password !== form.password_confirmation)
      next.password_confirmation = 'Passwords do not match';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const payload = {
        name: form.name.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        ...(method === 'email'
          ? { email: form.email.trim() }
          : { phone: form.phone.trim() }),
      };
      const { data } = await api.register(payload);
      setUser(data.user);
      setToken(data.access_token);
      setNotification('Account created — welcome to the studio.');
      navigate('/dashboard');
    } catch (err) {
      const res = err.response;
      if (res && res.status === 422 && res.data.errors) {
        const flat = {};
        Object.entries(res.data.errors).forEach(([k, v]) => (flat[k] = v[0]));
        setErrors(flat);
      } else {
        setNotification('Registration failed. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const socialUnavailable = (provider) =>
    setNotification(`${provider} sign-in isn’t available yet — please register with email or phone.`);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-md w-full space-y-8 bg-background-off p-8 sm:p-12 border border-black/5">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-5 block">Application</span>
            <Heading level={2} className="!text-3xl">Join the Studio</Heading>
            <Text className="mt-3 text-xs uppercase tracking-widest text-secondary font-light">
              Create an account to access projects &amp; viewings
            </Text>
          </div>

          {/* Method toggle */}
          <div className="grid grid-cols-2 border border-black/15">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMethod(m.id);
                  setErrors({});
                }}
                className={`py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  method === m.id ? 'bg-black text-white' : 'text-black/50 hover:text-black'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Field label="Full Name" error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
                className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                placeholder="Aarav Sharma"
              />
            </Field>

            {method === 'email' ? (
              <Field label="Email Address" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  inputMode="email"
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                  placeholder="name@example.com"
                />
              </Field>
            ) : (
              <Field label="Phone Number" error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                  placeholder="+91 98765 43210"
                />
              </Field>
            )}

            <PasswordInput
              label="Password"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
              placeholder="8–15 characters"
            />
            {errors.password && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold -mt-3">{errors.password}</p>
            )}

            {/* Live requirement checklist */}
            <ul className="grid grid-cols-1 xs:grid-cols-2 gap-x-4 gap-y-1.5">
              {PASSWORD_RULES.map((r) => {
                const ok = checks[r.key];
                return (
                  <li
                    key={r.key}
                    className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] ${
                      ok ? 'text-black' : 'text-black/35'
                    }`}
                  >
                    {ok ? <Check size={12} /> : <X size={12} />}
                    {r.label}
                  </li>
                );
              })}
            </ul>

            <PasswordInput
              label="Confirm Password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              autoComplete="new-password"
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold -mt-3">
                {errors.password_confirmation}
              </p>
            )}

            <Button type="submit" className="w-full !py-4" loading={loading}>
              Create Account
            </Button>
          </form>

          <SocialAuth onProvider={socialUnavailable} />

          <div className="text-center pt-2">
            <p className="text-[10px] uppercase tracking-widest text-secondary font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-black font-bold hover:text-accent transition-colors">
                Studio Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <div className={`border-b py-2 ${error ? 'border-red-400' : 'border-black/10'}`}>
        <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">{label}</span>
        {children}
      </div>
      {error && <p className="mt-1 text-red-500 text-[10px] uppercase tracking-widest font-bold">{error}</p>}
    </div>
  );
}
