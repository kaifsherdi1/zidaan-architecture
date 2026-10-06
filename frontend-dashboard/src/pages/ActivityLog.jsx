import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { apiError } from "../utils/auth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";

const AREAS = [
  { value: '', label: 'Everything' },
  { value: 'user.', label: 'Users & roles' },
  { value: 'agent.', label: 'Agents' },
  { value: 'property.', label: 'Listings' },
  { value: 'booking.', label: 'Viewings' },
  { value: 'transaction.', label: 'Transactions' },
  { value: 'enquiry.', label: 'Enquiries' },
];

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    axiosClient.get('/admin/activity', { params: { page, action: action || undefined, search: query || undefined } })
      .then(({ data }) => {
        setLogs(data.data || []);
        setMeta({ current_page: data.current_page, last_page: data.last_page });
      })
      .catch((err) => setError(apiError(err, 'Could not load the activity log.')))
      .finally(() => setLoading(false));
  }, [page, action, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
        <p className="text-slate-500">Who changed what — role changes, deletions, viewing decisions and money.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="text-sm text-slate-600 flex items-center gap-2">
          Area
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
            {AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); }} className="flex gap-2 flex-1 sm:max-w-sm">
          <label className="flex-1">
            <span className="sr-only">Search descriptions</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </label>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">When</TableCell>
              <TableCell as="th">Who</TableCell>
              <TableCell as="th">What</TableCell>
              <TableCell as="th" className="hidden md:table-cell">From IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading…</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">No activity recorded yet.</TableCell></TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-sm text-slate-600">
                  {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </TableCell>
                <TableCell className="text-sm">{log.user?.name || <span className="text-slate-400">System</span>}</TableCell>
                <TableCell className="text-sm">
                  <span className="block text-slate-900">{log.description}</span>
                  <span className="text-xs text-slate-400 font-mono">{log.action}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-slate-500 font-mono">{log.ip_address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />
    </div>
  );
}
