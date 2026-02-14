import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');

  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    password_confirmation: ''
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, maybe redirect back to forgot password?
      // navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setMessage('');
    setLoading(true);

    if (formData.password !== formData.password_confirmation) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match',
        confirmButtonColor: '#000000',
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.resetPassword({ ...formData, email });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: data.message || 'Password reset successfully!',
        confirmButtonColor: '#000000',
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors);
      } else {
        setMessage('Failed to reset password. Please try again.');
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
            <Heading level={2} className="!text-3xl">Reset Password</Heading>
            <Text className="mt-4 text-xs uppercase tracking-widest text-secondary font-light">
              Enter OTP and new password for {email}
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
              {!email && (
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
              )}

              <div className="border-b border-black/10 py-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">OTP Code</span>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
                  placeholder="Enter 6-digit OTP"
                />
              </div>

              <div className="border-b border-black/10 py-2">
                <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">New Password</span>
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
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
