import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import api from '../services/api';
import { useStateContext } from '../contexts/ContextProvider';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken, setNotification } = useStateContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    try {
      const { data } = await api.login(formData);
      setUser(data.user);
      setToken(data.token);
      setNotification('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        const errors = response.data.errors;

        // Handle specific error messages with alerts
        if (errors.email) {
          const emailError = errors.email[0];
          if (emailError === 'Please register first') {
            alert(emailError);
            navigate('/register');
          } else if (emailError === 'Incorrect password, try again') {
            alert(emailError);
          } else if (emailError === 'Please enter email') {
            alert(emailError);
          }
        }

        if (errors.password) {
          const passwordError = errors.password[0];
          if (passwordError === 'Please fill the password') {
            alert(passwordError);
          }
        }

        setErrors(errors);
      } else if (response && response.status === 401) {
        let message = response.data.message;
        setErrors({ email: [message] });
      } else {
        setNotification('Login failed. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-md w-full space-y-12 bg-background-off p-12 border border-black/5">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">Access</span>
            <Heading level={2} className="!text-3xl">Studio Login</Heading>
            <Text className="mt-4 text-xs uppercase tracking-widest text-secondary font-light">
              Manage your architectural journey
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

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="border-b border-black/10 py-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">Email Address</span>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
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
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-[10px] uppercase tracking-widest text-secondary font-medium hover:text-black transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full !py-4" loading={loading}>
              Enter Studio
            </Button>
          </form>

          <div className="text-center pt-6">
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
