import { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaTrash, FaSearch } from "react-icons/fa";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { apiError, formatINR } from "../utils/auth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_STYLE = {
  new: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-700',
  closed: 'bg-slate-100 text-slate-600',
};

export default function Enquiries() {
  const { setNotification } = useStateContext();
  const [enquiries, setEnquiries] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('new');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    axiosClient.get('/admin/enquiries', { params: { page, status: status || undefined, type: type || undefined, search: query || undefined } })
      .then(({ data }) => {
        setEnquiries(data.data || []);
        setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total });
      })
      .catch((err) => setError(apiError(err, 'Could not load enquiries.')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, status, type, query]);  

  useEffect(() => {
    // Anyone on staff can be assigned a lead.
    Promise.all(['admin', 'manager', 'agent'].map((role) =>
      axiosClient.get('/admin/users', { params: { role, per_page: 100, is_active: 1 } }).then(({ data }) => data.data || [])
    )).then((lists) => setStaff(lists.flat())).catch(() => setStaff([]));
  }, []);

  const update = (enquiry, changes, message) => {
    return axiosClient.put(`/admin/enquiries/${enquiry.id}`, changes)
      .then(({ data }) => {
        setEnquiries((list) => list.map((e) => (e.id === enquiry.id ? { ...e, ...data.data } : e)));
        if (selected?.id === enquiry.id) setSelected({ ...selected, ...data.data });
        if (message) setNotification(message);
      })
      .catch((err) => setNotification(apiError(err)));
  };

  const openEnquiry = (enquiry) => {
    setSelected(enquiry);
    setNotes(enquiry.internal_notes || '');
  };

  const confirmDelete = () => {
    axiosClient.delete(`/admin/enquiries/${toDelete.id}`)
      .then(() => {
        setNotification('Enquiry deleted.');
        setToDelete(null);
        setSelected(null);
        load();
      })
      .catch((err) => {
        setNotification(apiError(err));
        setToDelete(null);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Enquiries</h1>
          <p className="text-slate-500">Messages from the Contact and Sell-your-property forms.</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }}
          className="flex gap-2 w-full lg:w-auto"
        >
          <label className="relative flex-1 lg:w-64">
            <span className="sr-only">Search enquiries</span>
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" aria-hidden />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </label>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-lg border border-slate-200" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => { setStatus(s.value); setPage(1); }}
              aria-pressed={status === s.value}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${status === s.value ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="text-sm text-slate-600 flex items-center gap-2">
          Type
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white">
            <option value="">All</option>
            <option value="contact">Contact</option>
            <option value="sell">Sell</option>
          </select>
        </label>
        <span className="text-sm text-slate-500 ml-auto">{meta.total} total</span>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <Card className="divide-y divide-slate-100">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading enquiries…</p>
        ) : enquiries.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No enquiries here.</p>
        ) : enquiries.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => openEnquiry(e)}
            className="w-full text-left p-4 hover:bg-slate-50 focus:bg-slate-50 outline-none flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-900">{e.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${e.type === 'sell' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {e.type === 'sell' ? 'Sell' : 'Contact'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[e.status] || ''}`}>{e.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-slate-500 truncate">{e.subject || e.message || '—'}</p>
            </div>
            <div className="text-xs text-slate-400 sm:text-right shrink-0">
              {new Date(e.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              {e.assignee && <div className="text-slate-500">→ {e.assignee.name}</div>}
            </div>
          </button>
        ))}
      </Card>

      <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `Enquiry from ${selected.name}` : ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-4 text-slate-600">
              <a href={`mailto:${selected.email}`} className="flex items-center gap-2 hover:text-primary"><FaEnvelope aria-hidden /> {selected.email}</a>
              {selected.phone && <a href={`tel:${selected.phone}`} className="flex items-center gap-2 hover:text-primary"><FaPhone aria-hidden /> {selected.phone}</a>}
            </div>

            {selected.subject && <p className="font-medium text-slate-800">{selected.subject}</p>}
            {selected.message && <p className="whitespace-pre-line text-slate-700 bg-slate-50 p-3 rounded-lg">{selected.message}</p>}

            {selected.details && (
              <dl className="grid grid-cols-2 gap-2 bg-emerald-50 p-3 rounded-lg">
                {selected.details.address && <><dt className="text-slate-500">Address</dt><dd>{selected.details.address}</dd></>}
                {selected.details.type && <><dt className="text-slate-500">Property type</dt><dd className="capitalize">{selected.details.type}</dd></>}
                {selected.details.bedrooms && <><dt className="text-slate-500">Bedrooms</dt><dd>{selected.details.bedrooms}</dd></>}
                {selected.details.price && <><dt className="text-slate-500">Asking price</dt><dd>{formatINR(selected.details.price)}</dd></>}
              </dl>
            )}
            {selected.property && <p className="text-slate-600">About listing: <span className="font-medium">{selected.property.title}</span></p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-slate-700 font-medium mb-1">Status</span>
                <select
                  value={selected.status}
                  onChange={(ev) => update(selected, { status: ev.target.value }, 'Status updated.')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  {STATUSES.filter((s) => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-slate-700 font-medium mb-1">Assigned to</span>
                <select
                  value={selected.assigned_to || ''}
                  onChange={(ev) => update(selected, { assigned_to: ev.target.value || null }, 'Assignment updated.')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">Unassigned</option>
                  {staff.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role?.name})</option>)}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="block text-slate-700 font-medium mb-1">Internal notes</span>
              <textarea
                value={notes}
                onChange={(ev) => setNotes(ev.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Only visible to staff"
              />
            </label>

            <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-slate-100">
              <Button variant="danger" onClick={() => setToDelete(selected)} className="flex items-center gap-2">
                <FaTrash aria-hidden /> Delete
              </Button>
              <Button onClick={() => update(selected, { internal_notes: notes }, 'Notes saved.')}>Save notes</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!toDelete} onClose={() => setToDelete(null)} title="Delete enquiry?">
        <p className="text-slate-600 mb-6">This permanently removes the message from {toDelete?.name}. This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
