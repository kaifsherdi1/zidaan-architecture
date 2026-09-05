import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../axios-client';

export default function NotificationDropdown({ onLight = true }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = () => {
    axiosClient.get('/notifications/unread-count')
      .then(({ data }) => setUnreadCount(data.count || 0))
      .catch(() => {});
  };

  const fetchNotifications = () => {
    axiosClient.get('/notifications')
      .then(({ data }) => setNotifications(data.data || []))
      .catch(() => {});
  };

  const toggleDropdown = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  };

  const markAsRead = (id) => {
    axiosClient.put(`/notifications/${id}/read`).then(() => {
      setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    });
  };

  const markAllAsRead = () => {
    axiosClient.put('/notifications/mark-all-read').then(() => {
      setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-label="Notifications"
        className={`relative transition-colors ${
          onLight ? 'text-black/50 hover:text-black' : 'text-white/60 hover:text-white'
        }`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-[3px] bg-accent text-black text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white shadow-xl border border-black/5 z-50">
          <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-black">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] uppercase tracking-[0.14em] text-black/45 hover:text-black transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center text-[11px] uppercase tracking-[0.14em] text-black/35">
                Nothing yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-5 py-4 border-b border-black/5 last:border-0 flex gap-3 ${
                    !n.is_read ? 'bg-background-off' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {n.title && (
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-black mb-1">{n.title}</p>
                    )}
                    <p className="text-[13px] text-secondary font-light leading-snug">{n.message}</p>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-black/30 mt-1.5 block">
                      {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      aria-label="Mark as read"
                      className="shrink-0 text-black/30 hover:text-black transition-colors"
                    >
                      <Check size={15} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block px-5 py-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-black/60 hover:text-black hover:bg-background-off transition-colors border-t border-black/5"
          >
            View account
          </Link>
        </div>
      )}
    </div>
  );
}
