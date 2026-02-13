import { useState } from 'react';
import { X, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import axiosClient from '../axios-client';

export default function BookingModal({ isOpen, onClose, property }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      property_id: property.id,
      start_date: startDate,
      end_date: endDate, // Optional, depending on property type
      notes: notes
    };

    axiosClient.post('/bookings', payload)
      .then(() => {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setStartDate('');
          setEndDate('');
          setNotes('');
        }, 2000);
      })
      .catch((err) => {
        setLoading(false);
        const response = err.response;
        if (response && response.status === 422) {
          setError(response.data.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-900">Request Booking</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Summary */}
        <div className="p-4 bg-slate-50/50 flex gap-4 items-center border-b border-slate-100">
          <img
            src={property.images && property.images[0] ? property.images[0].image_url : 'https://via.placeholder.com/150'}
            alt={property.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h4 className="font-medium text-slate-900 line-clamp-1">{property.title}</h4>
            <p className="text-primary font-bold text-sm">
              ${Number(property.price).toLocaleString()} <span className="text-slate-500 font-normal">/ {property.type === 'rent' ? 'month' : 'total'}</span>
            </p>
          </div>
        </div>

        {/* Form or Success State */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Request Sent!</h3>
              <p className="text-slate-600">The agent will review your request and get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {property.type === 'rent' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  <textarea
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-24"
                    placeholder="I'm interested in this property..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
