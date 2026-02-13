import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../axios-client';
import { useStateContext } from '../contexts/ContextProvider';
import { FaFingerprint } from "react-icons/fa";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useStateContext();

  const onSubmit = (ev) => {
    ev.preventDefault();
    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }
    setErrors(null);
    setLoading(true);
    axiosClient.post('/auth/login', payload)
      .then(({ data }) => {
        setUser(data.user);
        setToken(data.access_token);
        setLoading(false);
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        } else {
          setErrors({
            email: [response?.data?.message || 'An error occurred']
          });
        }
        setLoading(false);
      })
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-down border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <FaFingerprint className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
        <p className="text-slate-500 mt-1">Sign in to access your dashboard</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {errors && <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 rounded text-sm">
          {Object.keys(errors).map(key => (<p key={key}>{errors[key][0]}</p>))}
        </div>}

        <Input
          ref={emailRef}
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          error={errors?.email?.[0]}
        />

        <Input
          ref={passwordRef}
          type="password"
          label="Password"
          placeholder="••••••••"
          error={errors?.password?.[0]}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
            <span className="text-slate-600">Remember me</span>
          </label>
          <Link to="#" className="text-primary hover:text-primary-dark font-medium">Forgot password?</Link>
        </div>

        <Button type="submit" disabled={loading} className="w-full shadow-lg shadow-primary/20">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <p className="text-center text-sm text-slate-600 mt-6">
          Not a member? <Link to="/register" className="text-primary hover:text-primary-dark font-bold hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  )
}

