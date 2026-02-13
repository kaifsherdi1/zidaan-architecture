import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = () => {
    axiosClient.get('/notifications/unread-count')
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => { }); // User might not be logged in

    if (isOpen) {
      axiosClient.get('/notifications')
        .then(({ data }) => setNotifications(data))
        .catch(() => { });
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      axiosClient.get('/notifications')
        .then(({ data }) => setNotifications(data))
        .catch(() => { });
    }
  };

  const markAsRead = (id) => {
    axiosClient.put(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      });
  };

  const markAllAsRead = () => {
    axiosClient.put('/notifications/mark-all-read')
      .then(() => {
        setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })));
        setUnreadCount(0);
      });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary hover:text-primary-dark font-medium">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notification.read_at ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 mb-1">{notification.data.message}</p>
                      <span className="text-xs text-slate-400">{new Date(notification.created_at).toLocaleDateString()}</span>
                    </div>
                    {!notification.read_at && (
                      <button onClick={() => markAsRead(notification.id)} className="text-slate-400 hover:text-primary">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
