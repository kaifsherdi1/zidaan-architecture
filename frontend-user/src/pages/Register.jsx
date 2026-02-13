import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import api from '../services/api';
import { useStateContext } from '../contexts/ContextProvider';

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken, setNotification } = useStateContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    try {
      const { data } = await api.register(formData);
      setUser(data.user);
      setToken(data.token);
      setNotification('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors);
      } else {
        setNotification('Registration failed. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-md w-full space-y-10 bg-background-off p-12 border border-black/5">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">Application</span>
            <Heading level={2} className="!text-3xl">Join the Studio</Heading>
            <Text className="mt-4 text-xs uppercase tracking-widest text-secondary font-light">
              Register to access exclusive architectural projects
            </Text>
          </div>

          {errors && (
            <div className="text-red-500 text-[10px] uppercase tracking-widest font-bold">
              <ul className="space-y-1">
                {Object.keys(errors).map(key => (
                  <li key={key}>{errors[key][0]}</li>
                ))}
              </ul>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="border-b border-black/10 py-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">Full Name</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                  placeholder="John Doe"
                />
              </div>
              <div className="border-b border-black/10 py-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">Email Address</span>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                  placeholder="email@example.com"
                />
              </div>
              <div className="border-b border-black/10 py-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">Password</span>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                />
              </div>
              <div className="border-b border-black/10 py-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">Confirm Password</span>
                <input
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                />
              </div>
            </div>

            <Button type="submit" className="w-full !py-4" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="text-center pt-6">
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
