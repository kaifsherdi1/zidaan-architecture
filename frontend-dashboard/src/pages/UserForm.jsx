import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../axios-client";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'user'
    }
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/admin/users/${id}`)
        .then(({ data }) => {
          setLoading(false);
          const userData = data.data;
          // Set form values
          Object.keys(userData).forEach(key => {
            if (['name', 'email', 'role'].includes(key)) {
              setValue(key, userData[key]);
            }
          });
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id, setValue]);

  const onSubmit = (data) => {
    // If editing and password is empty, remove it from payload
    const payload = { ...data };
    if (id && !payload.password) {
      delete payload.password;
      delete payload.password_confirmation;
    }

    const request = id
      ? axiosClient.put(`/admin/users/${id}`, payload)
      : axiosClient.post('/admin/users', payload);

    request
      .then(() => {
        navigate('/users');
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          // Handle backend validation errors manually if needed
          // or ideally map them to react-hook-form setError
          console.error(response.data.errors);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={id ? "New Password (Optional)" : "Password"}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: !id && 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />

              <Input
                label={id ? "Confirm New Password" : "Confirm Password"}
                type="password"
                placeholder="••••••••"
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                {...register('role')}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => navigate('/users')}>Cancel</Button>
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

