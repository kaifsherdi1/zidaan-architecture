import { Eye, Check, X, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function BookingTable({ bookings, onStatusUpdate, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-slate-100 text-slate-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-slate-500">Loading bookings...</p>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No bookings found</h3>
        <p className="text-slate-500 mt-1">There are no booking requests matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                      {booking.property?.main_image ? (
                        <img className="h-10 w-10 object-cover" src={booking.property.main_image} alt="" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 line-clamp-1 max-w-[200px]" title={booking.property?.title}>
                        {booking.property?.title || 'Unknown Property'}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {booking.property?.type || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{booking.user?.name}</div>
                  <div className="text-xs text-slate-500">{booking.user?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {new Date(booking.start_date).toLocaleDateString()}
                  </div>
                  {booking.end_date && (
                    <div className="text-xs text-slate-500">
                      to {new Date(booking.end_date).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onStatusUpdate(booking.id, 'approved')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Approve"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onStatusUpdate(booking.id, 'rejected')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
