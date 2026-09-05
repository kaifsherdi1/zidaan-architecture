import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import axiosClient from "../axios-client";

const STAFF_ROLES = ['admin', 'manager', 'agent'];

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notStaff, setNotStaff] = useState(false);

  useEffect(() => {
    if (!token) return;
    axiosClient.get('/me')
      .then(({ data }) => {
        const roleSlug = typeof data.user?.role === 'object' ? data.user?.role?.slug : data.user?.role;
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
        if (err.response && err.response.status === 401) {
          setUser({});
          setToken(null);
        }
      });
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace state={notStaff ? { notStaff: true } : undefined} />;
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen md:pl-64 transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

