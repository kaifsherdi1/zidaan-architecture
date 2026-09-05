import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Card from "../components/ui/Card";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { setNotification, user } = useStateContext();

  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : (user?.role || '');
  const isStaffAdmin = roleSlug === 'admin' || roleSlug === 'manager';
  const basePath = isStaffAdmin ? '/admin/bookings' : '/agent/bookings';

  const fetchBookings = (status = null) => {
    setLoading(true);
    const params = status && status !== 'all' ? { status } : {};

    axiosClient.get(basePath, { params })
      .then(({ data }) => {
        setBookings(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (roleSlug) fetchBookings(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, roleSlug]);

  const handleStatusUpdate = (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this viewing as ${newStatus}?`)) return;

    axiosClient.put(`${basePath}/${id}/status`, { status: newStatus })
      .then(() => {
        setNotification(`Booking ${newStatus} successfully!`);
        fetchBookings(filter);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.data) {
          setNotification(response.data.message);
        }
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-slate-500">Manage property viewing requests and reservations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {['all', 'pending', 'approved', 'rejected', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${filter === status
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">Property</TableCell>
              <TableCell as="th">Client</TableCell>
              <TableCell as="th">Viewing</TableCell>
              <TableCell as="th">Status</TableCell>
              <TableCell as="th" className="text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading bookings...</TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">No bookings found.</TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {booking.property?.image ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}${booking.property.image}`}
                          alt={booking.property.title}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                          <span className="text-xs">No Img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1 max-w-[200px]">{booking.property?.title || 'Unknown Property'}</p>
                        <p className="text-xs text-slate-500">{booking.property?.city}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{booking.user?.name}</p>
                      <p className="text-xs text-slate-500">{booking.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-900 flex items-center gap-1">
                      <FaCalendarAlt className="text-slate-400 text-xs" />
                      {booking.formatted_date || booking.visit_date}
                    </div>
                    {booking.formatted_time && (
                      <div className="text-xs text-slate-500 ml-4">{booking.formatted_time}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'approved')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Mark completed
                        </button>
                      )}
                      {!['pending', 'approved'].includes(booking.status) && <span className="text-slate-400">—</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
