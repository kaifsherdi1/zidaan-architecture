import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../axios-client";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useStateContext } from "../contexts/ContextProvider";
import { apiError, applyServerErrors, roleOf } from "../utils/auth";

const ALL_ROLES = [
  { value: 'user', label: 'Client' },
  { value: 'agent', label: 'Agent' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
];

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: me, setNotification } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const isSelf = id && Number(id) === me?.id;

  // Managers may only create/assign agent and client accounts.
  const roles = roleOf(me) === 'admin' ? ALL_ROLES : ALL_ROLES.filter((r) => ['user', 'agent'].includes(r.value));

  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      role: 'agent',
      is_active: true,
    }
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/admin/users/${id}`)
        .then(({ data }) => {
          const userData = data.data;
          setValue('name', userData.name);
          setValue('email', userData.email || '');
          setValue('phone', userData.phone || '');
          setValue('role', userData.role?.slug || 'user');
          setValue('is_active', !!userData.is_active);
        })
        .catch((err) => setFormError(apiError(err, 'Could not load this user.')))
        .finally(() => setLoading(false));
    }
  }, [id, setValue]);

  const onSubmit = (data) => {
    setFormError('');
    const payload = { ...data, phone: data.phone || null };
    if (id && !payload.password) {
      delete payload.password;
      delete payload.password_confirmation;
    }
    if (isSelf) {
      // Your own role and status can't be changed here — the API refuses it.
      delete payload.role;
      delete payload.is_active;
    }

    const request = id
      ? axiosClient.put(`/admin/users/${id}`, payload)
      : axiosClient.post('/admin/users', payload);

    return request
      .then(() => {
        setNotification(id ? 'User updated.' : 'User created.');
        navigate('/users');
      })
      .catch(err => {
        if (!applyServerErrors(err, setError)) {
          setFormError(apiError(err));
        }
      });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{id ? 'Edit User' : 'New User'}</h1>
      </div>

      <Card className="p-6">
        {loading && <div className="text-center py-4">Loading user data...</div>}

        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {formError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{formError}</div>}

            <Input
              label="Full Name"
              placeholder="Priya Sharma"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="priya@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                placeholder="+91 98765 43210"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={id ? "New Password (Optional)" : "Password"}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password', {
                  required: !id && 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  validate: (val) => !val
                    || (/[A-Z]/.test(val) && /[a-z]/.test(val) && /\d/.test(val) && /[^A-Za-z0-9]/.test(val))
                    || 'Use upper and lower case letters, a number and a symbol',
                })}
              />

              <Input
                label={id ? "Confirm New Password" : "Confirm Password"}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.password_confirmation?.message}
                {...register('password_confirmation', {
                  validate: (val, formValues) => {
                    if (formValues.password && val !== formValues.password) {
                      return "Passwords do not match";
                    }
                    return true;
                  }
                })}
              />
            </div>
            {id && <p className="text-xs text-slate-500 -mt-3">Setting a new password signs the user out of every device.</p>}

            {!isSelf && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                  <select
                    id="role"
                    {...register('role')}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  {errors.role?.message && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
                </div>
                <label className="flex items-center gap-3 md:mt-7 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" {...register('is_active')} className="w-4 h-4" />
                  Account active (unticking signs them out and blocks login)
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => navigate('/users')}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save User'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
