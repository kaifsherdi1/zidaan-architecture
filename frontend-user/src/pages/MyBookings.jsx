import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import { IconHome, IconBuildingSkyscraper, IconUsers, IconCalendar as IconCalendarNav, IconUser } from '@tabler/icons-react';
import FloatingDock from "../components/ui/FloatingDock";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token] = useState(localStorage.getItem('ACCESS_TOKEN'));

  const navItems = [
    { title: "Home", icon: <IconHome className="h-full w-full" />, href: "/" },
    { title: "Properties", icon: <IconBuildingSkyscraper className="h-full w-full" />, href: "/properties" },
    { title: "Agents", icon: <IconUsers className="h-full w-full" />, href: "/agents" },
    ...(token ? [
      { title: "My Bookings", icon: <IconCalendarNav className="h-full w-full" />, href: "/my-bookings" },
      { title: "Profile", icon: <IconUser className="h-full w-full" />, href: "/profile" },
    ] : []),
  ];

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/user/bookings')
      .then(({ data }) => {
        setLoading(false);
        setBookings(data.data);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const cancelBooking = (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    axiosClient.post(`/user/bookings/${id}/cancel`)
      .then(() => {
        // Refresh list
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      });
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50">
      <FloatingDock items={navItems} />
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Bookings</h1>

        {loading && <div className="text-center py-10">Loading...</div>}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-slate-500 mb-4">You haven't booked any viewings yet.</p>
            <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="relative h-48">
                <img src={booking.property.image} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                                ${booking.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                      booking.status === 'approved' ? 'bg-green-500 text-white' :
                        booking.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{booking.property.title}</h3>
                <div className="flex items-center text-slate-500 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booking.property.address}
                </div>

                <div className="flex items-center justify-between py-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{booking.visit_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{booking.visit_time}</span>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="w-full mt-4 btn bg-red-50 text-red-600 hover:bg-red-100 border-transparent"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
