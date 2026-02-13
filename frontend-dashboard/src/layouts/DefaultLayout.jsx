import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import axiosClient from "../axios-client";

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" />
  }

  useEffect(() => {
    axiosClient.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user); // key fix: data.user was the structure in AuthController
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setUser({});
          setToken(null);
        }
      })
  }, []);

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

