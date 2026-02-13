import { useRef, useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { FaUser, FaLock, FaSave, FaExclamationCircle } from "react-icons/fa";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

export default function Profile() {
  const { user, setUser, setNotification } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  // Profile Info refs
  const nameRef = useRef(user.name);
  const emailRef = useRef(user.email);

  // Password refs
  const currentPasswordRef = useRef();
  const newPasswordRef = useRef();
  const confirmPasswordRef = useRef();

  const onUpdateProfile = (ev) => {
    ev.preventDefault();
    setErrors(null);
    setLoading(true);

    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
    };

    axiosClient.put('/profile', payload)
      .then(({ data }) => {
        setNotification('Profile updated successfully');
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
        setLoading(false);
      });
  };

  const onUpdatePassword = (ev) => {
    ev.preventDefault();
    setErrors(null);
    setLoading(true);

    const payload = {
      current_password: currentPasswordRef.current.value,
      password: newPasswordRef.current.value,
      password_confirmation: confirmPasswordRef.current.value,
    };

    axiosClient.put('/profile/password', payload)
      .then(() => {
        setNotification('Password updated successfully');
        // Clear password fields
        currentPasswordRef.current.value = "";
        newPasswordRef.current.value = "";
        confirmPasswordRef.current.value = "";
        setLoading(false);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile & Settings</h1>
        <p className="text-slate-500">Manage your account information and security.</p>
      </div>

      {errors && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3">
          <FaExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            {Object.keys(errors).map((key) => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info Card */}
        <Card className="p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FaUser className="text-slate-400" /> Personal Information
          </h2>
          <form onSubmit={onUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                defaultValue={user.name}
                ref={nameRef}
                type="text"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                defaultValue={user.email}
                ref={emailRef}
                type="email"
                className="input-field"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
                <FaSave /> Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FaLock className="text-slate-400" /> Change Password
          </h2>
          <form onSubmit={onUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                ref={currentPasswordRef}
                type="password"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                ref={newPasswordRef}
                type="password"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                ref={confirmPasswordRef}
                type="password"
                className="input-field"
              />
            </div>
            <div className="pt-2">
              <Button variant="secondary" type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
                <FaLock /> Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

