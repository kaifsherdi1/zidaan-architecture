import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import PasswordInput from '../components/ui/PasswordInput';
import SocialAuth from '../components/auth/SocialAuth';
import { Heading, Text } from '../components/ui/Typography';
import api from '../services/api';
import { useStateContext } from '../contexts/ContextProvider';

const METHODS = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
];

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken, setNotification } = useStateContext();

  const [method, setMethod] = useState('email');
  const [form, setForm] = useState({ login: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.login.trim()) next.login = method === 'email' ? 'Enter your email address' : 'Enter your phone number';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { data } = await api.login({ login: form.login.trim(), password: form.password });
      setUser(data.user);
      setToken(data.access_token);
      setNotification('Signed in.');
      navigate('/dashboard');
    } catch (err) {
      const res = err.response;
      if (res && (res.status === 422 || res.status === 401) && res.data?.errors) {
        const flat = {};
        Object.entries(res.data.errors).forEach(([k, v]) => (flat[k === 'email' ? 'login' : k] = v[0]));
        setErrors(flat);
      } else if (res && res.status === 401) {
        setErrors({ login: res.data.message || 'Invalid credentials' });
      } else {
        setNotification('Sign in failed. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const socialUnavailable = (provider) =>
    setNotification(`${provider} sign-in isn’t available yet — please use your email or phone.`);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-md w-full space-y-8 bg-background-off p-8 sm:p-12 border border-black/5">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-5 block">Access</span>
            <Heading level={2} className="!text-3xl">Studio Login</Heading>
            <Text className="mt-3 text-xs uppercase tracking-widest text-secondary font-light">
              Manage your enquiries &amp; viewings
            </Text>
          </div>

          <div className="grid grid-cols-2 border border-black/15">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMethod(m.id);
                  setForm((f) => ({ ...f, login: '' }));
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

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <div className={`border-b py-2 ${errors.login ? 'border-red-400' : 'border-black/10'}`}>
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </span>
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  inputMode={method === 'email' ? 'email' : 'tel'}
                  autoComplete={method === 'email' ? 'email' : 'tel'}
                  value={form.login}
                  onChange={set('login')}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                  placeholder={method === 'email' ? 'name@example.com' : '+91 98765 43210'}
                />
              </div>
              {errors.login && (
                <p className="mt-1 text-red-500 text-[10px] uppercase tracking-widest font-bold">{errors.login}</p>
              )}
            </div>

            <div>
              <PasswordInput
                label="Password"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="mt-1 text-red-500 text-[10px] uppercase tracking-widest font-bold">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[10px] uppercase tracking-widest text-secondary font-medium hover:text-black transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="w-full !py-4" loading={loading}>
              Enter Studio
            </Button>
          </form>

          <SocialAuth onProvider={socialUnavailable} />

          <div className="text-center pt-2">
            <p className="text-[10px] uppercase tracking-widest text-secondary font-medium">
              New to the studio?{' '}
              <Link to="/register" className="text-black font-bold hover:text-accent transition-colors">
                Apply for Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
