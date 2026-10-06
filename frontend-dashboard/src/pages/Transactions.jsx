import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { FaFileExcel, FaDownload, FaCheckCircle, FaClock, FaTimesCircle, FaPlus } from "react-icons/fa";
import { apiError, formatINR, isOfficeStaff } from "../utils/auth";

function downloadBlob(url, filename) {
  return axiosClient.get(url, { responseType: 'blob' }).then(({ data }) => {
    const objectUrl = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  });
}

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY_FORM = { property_id: '', client_name: '', amount: '', transaction_date: today(), status: 'pending', notes: '' };

export default function Transactions() {
  const { user, setNotification } = useStateContext();
  const office = isOfficeStaff(user);

  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [listings, setListings] = useState([]);
  const [confirm, setConfirm] = useState(null); // { transaction, status }

  const fetchTransactions = () => {
    setLoading(true);
    setError('');
    axiosClient.get(office ? '/admin/transactions' : '/agent/transactions', { params: { page, status: status || undefined } })
      .then(({ data }) => {
        setTransactions(data.data || []);
        setMeta({ current_page: data.meta?.current_page || 1, last_page: data.meta?.last_page || 1 });
      })
      .catch((err) => setError(apiError(err, 'Could not load transactions.')))
      .finally(() => setLoading(false));

    axiosClient.get(office ? '/admin/transactions/report' : '/agent/earnings')
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary(null));
  };

  useEffect(fetchTransactions, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const openForm = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
    // Only listings still on the market can be sold or let.
    axiosClient.get(office ? '/manager/properties' : '/agent/properties', { params: { per_page: 60, status: 'available' } })
      .then(({ data }) => setListings(data.data || []))
      .catch(() => setListings([]));
  };

  const submit = (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    axiosClient.post(office ? '/admin/transactions' : '/agent/transactions', { ...form, notes: form.notes || null })
      .then(() => {
        setFormOpen(false);
        setNotification(office ? 'Transaction recorded.' : 'Transaction submitted — the office will confirm it.');
        setPage(1);
        fetchTransactions();
      })
      .catch((err) => setFormError(apiError(err)))
      .finally(() => setSaving(false));
  };

  const changeStatus = () => {
    const { transaction, status: next } = confirm;
    axiosClient.put(`/admin/transactions/${transaction.id}`, { status: next })
      .then(() => {
        setNotification(`Transaction #${transaction.id} marked ${next}.`);
        fetchTransactions();
      })
      .catch((err) => setNotification(apiError(err)))
      .finally(() => setConfirm(null));
  };

  const handleDownloadInvoice = (id) => {
    downloadBlob(`/admin/transactions/${id}/invoice`, `invoice-${id}.pdf`)
      .catch(() => setNotification('Could not download the invoice.'));
  };

  const handleExport = () => {
    downloadBlob('/admin/reports/transactions', 'transactions.xlsx')
      .catch(() => setNotification('Could not export transactions.'));
  };

  const selectedListing = listings.find((l) => String(l.id) === String(form.property_id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-500">
            {office ? 'Sales and lettings closed by the studio, with invoices.' : 'Deals on your listings. New entries are confirmed by the office.'}
          </p>
        </div>
        <div className="flex gap-2">
          {office && (
            <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2">
              <FaFileExcel className="text-green-600" aria-hidden /> Export Excel
            </Button>
          )}
          <Button onClick={openForm} className="flex items-center gap-2">
            <FaPlus aria-hidden /> Record transaction
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4"><p className="text-sm text-slate-500">Completed revenue</p><p className="text-xl font-bold text-slate-900">{formatINR(summary.total_revenue)}</p></Card>
          <Card className="p-4"><p className="text-sm text-slate-500">Completed deals</p><p className="text-xl font-bold text-slate-900">{summary.total_completed}</p></Card>
          <Card className="p-4"><p className="text-sm text-slate-500">Awaiting confirmation</p><p className="text-xl font-bold text-slate-900">{summary.total_pending} <span className="text-sm font-normal text-slate-500">({formatINR(summary.pending_value)})</span></p></Card>
        </div>
      )}

      <div className="flex flex-wrap gap-1 bg-white p-1 rounded-lg border border-slate-200 w-fit" role="group" aria-label="Filter by status">
        {['', 'pending', 'completed', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            aria-pressed={status === s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize ${status === s ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {s || 'all'}
          </button>
        ))}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">ID</TableCell>
              <TableCell as="th">Property</TableCell>
              <TableCell as="th">Client</TableCell>
              <TableCell as="th">Amount</TableCell>
              <TableCell as="th">Date</TableCell>
              <TableCell as="th">Status</TableCell>
              <TableCell as="th" className="text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading transactions...</TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">No transactions found.</TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">#{transaction.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900 line-clamp-1 max-w-[200px]" title={transaction.property?.title}>
                      {transaction.property?.title || 'Unknown Property'}
                    </div>
                    {office && transaction.agent && <div className="text-xs text-slate-500">{transaction.agent.name}</div>}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-900">{transaction.client_name}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-900">{formatINR(transaction.amount)}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{transaction.transaction_date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {transaction.status === 'completed' && <FaCheckCircle className="text-xs" aria-hidden />}
                      {transaction.status === 'pending' && <FaClock className="text-xs" aria-hidden />}
                      {transaction.status === 'cancelled' && <FaTimesCircle className="text-xs" aria-hidden />}
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {office && (
                      <div className="flex items-center justify-end gap-3 text-sm whitespace-nowrap">
                        {transaction.status === 'pending' && (
                          <button type="button" onClick={() => setConfirm({ transaction, status: 'completed' })} className="text-green-700 hover:underline font-medium">
                            Complete
                          </button>
                        )}
                        {transaction.status !== 'cancelled' && (
                          <button type="button" onClick={() => setConfirm({ transaction, status: 'cancelled' })} className="text-red-600 hover:underline">
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(transaction.id)}
                          className="text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1"
                        >
                          <FaDownload className="text-xs" aria-hidden /> Invoice
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Record transaction" maxWidth="max-w-lg">
        <form onSubmit={submit} className="space-y-4 text-sm">
          {formError && <div className="p-3 bg-red-50 text-red-700 rounded-lg" role="alert">{formError}</div>}

          <label className="block">
            <span className="block font-medium text-slate-700 mb-1">Listing</span>
            <select
              required
              value={form.property_id}
              onChange={(e) => {
                const listing = listings.find((l) => String(l.id) === e.target.value);
                setForm({ ...form, property_id: e.target.value, amount: form.amount || (listing ? Math.round(listing.price) : '') });
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">{listings.length ? 'Choose an available listing…' : 'No available listings'}</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>{l.title} — {l.location?.city} ({l.type === 'rent' ? 'rent' : 'sale'})</option>
              ))}
            </select>
            {selectedListing && <span className="text-xs text-slate-500">Listed at {selectedListing.price_label}</span>}
          </label>

          <label className="block">
            <span className="block font-medium text-slate-700 mb-1">Client name</span>
            <input required maxLength={255} value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block font-medium text-slate-700 mb-1">Amount (₹)</span>
              <input required type="number" min="1" step="1" inputMode="numeric" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </label>
            <label className="block">
              <span className="block font-medium text-slate-700 mb-1">Deal date</span>
              <input required type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </label>
          </div>

          {office && (
            <label className="block">
              <span className="block font-medium text-slate-700 mb-1">Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white">
                <option value="pending">Pending — deal agreed, not yet closed</option>
                <option value="completed">Completed — closes the listing as sold / rented</option>
              </select>
            </label>
          )}

          <label className="block">
            <span className="block font-medium text-slate-700 mb-1">Notes <span className="font-normal text-slate-400">(optional)</span></span>
            <textarea rows={2} maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirm} onClose={() => setConfirm(null)} title={confirm?.status === 'completed' ? 'Complete this transaction?' : 'Cancel this transaction?'}>
        {confirm && (
          <>
            <p className="text-slate-600 mb-6 text-sm">
              {confirm.status === 'completed'
                ? `This records ${formatINR(confirm.transaction.amount)} as revenue and marks "${confirm.transaction.property?.title}" as ${confirm.transaction.property?.type === 'rent' ? 'rented' : 'sold'}. The amount and date are locked afterwards.`
                : confirm.transaction.status === 'completed'
                  ? `The deal fell through: "${confirm.transaction.property?.title}" goes back on the market and the revenue is removed from reports.`
                  : 'This discards the pending deal. It stays in the ledger as cancelled.'}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirm(null)}>Back</Button>
              <Button variant={confirm.status === 'completed' ? 'primary' : 'danger'} onClick={changeStatus}>
                {confirm.status === 'completed' ? 'Mark completed' : 'Cancel transaction'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
