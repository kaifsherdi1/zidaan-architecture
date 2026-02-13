import { useStateContext } from "../../contexts/ContextProvider";
import axiosClient from "../../axios-client";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import NotificationDropdown from "../NotificationDropdown";

export default function Header({ onMenuClick }) {
  const { setUser, setToken } = useStateContext();

  const onLogout = (ev) => {
    ev.preventDefault();
    axiosClient.post('/logout')
      .then(() => {
        setUser({});
        setToken(null);
      })
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-sm">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <FaBars className="text-xl" />
      </button>

      <div className="hidden md:block text-slate-500 text-sm">
        { /* Breadcrumbs or Page Title could go here */}
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

