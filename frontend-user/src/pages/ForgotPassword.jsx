import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import api from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.forgotPassword({ email });
      setMessage(data.message);
      // Navigate to reset password page after short delay, passing email
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors);
      } else {
        setMessage('Failed to send OTP. Please try again.');
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
            <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">Recovery</span>
            <Heading level={2} className="!text-3xl">Forgot Password</Heading>
            <Text className="mt-4 text-xs uppercase tracking-widest text-secondary font-light">
              Enter your email to receive an OTP
            </Text>
          </div>

          {message && (
            <div className={`text-[10px] uppercase tracking-widest font-bold text-center ${message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </div>
          )}

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                />
              </div>
            </div>

            <Button type="submit" className="w-full !py-4" loading={loading}>
              Send OTP
            </Button>
          </form>

          <div className="text-center pt-6">
            <Link to="/login" className="text-[10px] uppercase tracking-widest text-secondary font-medium hover:text-black transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
