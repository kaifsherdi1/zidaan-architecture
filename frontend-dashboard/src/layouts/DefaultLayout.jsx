import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import axiosClient from "../axios-client";
import { roleOf } from "../utils/auth";

const STAFF_ROLES = ['admin', 'manager', 'agent'];

export default function DefaultLayout() {
  const { user, token, notification, setUser, setToken, setNotification } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notStaff, setNotStaff] = useState(false);

  useEffect(() => {
    if (!token) return;
    axiosClient.get('/me')
      .then(({ data }) => {
        const roleSlug = roleOf(data.user);
        if (roleSlug && !STAFF_ROLES.includes(roleSlug)) {
          // This dashboard is a staff tool — clients belong on the public site.
          setUser({});
          setToken(null);
          setNotStaff(true);
          return;
        }
        setUser(data.user);
      })
      .catch((err) => {
        if (err.response && [401, 403].includes(err.response.status)) {
          setUser({});
          setToken(null);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace state={notStaff ? { notStaff: true } : undefined} />;
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen md:pl-64 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {user?.id ? <Outlet /> : <div className="py-16 text-center text-slate-500">Loading…</div>}
          </div>
        </main>
      </div>

      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-start gap-3"
        >
          <span className="flex-1">{notification}</span>
          <button type="button" onClick={() => setNotification('')} className="text-slate-400 hover:text-white" aria-label="Dismiss">✕</button>
        </div>
      )}
    </div>
  )
}
