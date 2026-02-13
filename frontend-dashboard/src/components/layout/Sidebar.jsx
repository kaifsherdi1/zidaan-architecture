
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserTie,
  FaTachometerAlt,
  FaUserCircle,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
  FaList
} from "react-icons/fa";
import { useStateContext } from "../../contexts/ContextProvider";
import clsx from "clsx";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useStateContext();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    Properties: true // expanded by default
  });

  const toggleMenu = (name) => {
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt, roles: ['admin', 'agent', 'user'] },
    {
      name: 'Properties',
      icon: FaHome,
      roles: ['admin', 'manager', 'agent'],
      submenu: [
        { name: 'List Properties', path: '/properties', icon: FaList },
        { name: 'Add Property', path: '/properties/new', icon: FaPlus },
      ]
    },
    { name: 'Bookings', path: '/bookings', icon: FaCalendarAlt, roles: ['admin', 'agent', 'user'] },
    { name: 'Agents', path: '/agents', icon: FaUserTie, roles: ['admin'] },
    { name: 'Users', path: '/users', icon: FaUsers, roles: ['admin'] },
    { name: 'Transactions', path: '/transactions', icon: FaMoneyBillWave, roles: ['admin', 'agent'] },
    { name: 'Profile', path: '/profile', icon: FaUserCircle, roles: ['admin', 'agent', 'user'] },
  ];

  const userRole = typeof user?.role === 'object' ? user?.role?.slug : (user?.role || 'user');
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex-shrink-0 flex items-center justify-center border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <FaBuilding className="text-2xl text-primary" />
            <span className="text-xl font-bold text-slate-800 tracking-tight">Zidaan</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            // Check if current path matches item path OR any of its submenu paths
            const isActive = item.submenu
              ? item.submenu.some(sub => location.pathname === sub.path)
              : location.pathname.startsWith(item.path);

            if (item.submenu) {
              const isExpanded = expandedMenus[item.name];
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={clsx(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-slate-50 text-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={clsx("text-lg", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
                      {item.name}
                    </div>
                    {isExpanded ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                  </button>

                  {isExpanded && (
                    <div className="pl-4 space-y-1">
                      {item.submenu.map(subItem => {
                        const SubIcon = subItem.icon;
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => onClose && window.innerWidth < 768 && onClose()}
                            className={clsx(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                              isSubActive
                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                : "text-slate-500 hover:text-primary hover:bg-slate-50"
                            )}
                          >
                            <SubIcon className={clsx("text-sm", isSubActive ? "text-white" : "text-slate-400")} />
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onClose && window.innerWidth < 768 && onClose()}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <Icon className={clsx("text-lg", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

