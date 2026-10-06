import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios-client";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { FaUserTie, FaEnvelope, FaPhone, FaBuilding, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useStateContext } from "../contexts/ContextProvider";
import { apiError } from "../utils/auth";

export default function Agents() {
  const { setNotification } = useStateContext();
  const [agents, setAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [removing, setRemoving] = useState(null);
  const [reassignTo, setReassignTo] = useState('');
  const [removeError, setRemoveError] = useState('');

  const getAgents = () => {
    setLoading(true);
    setError('');
    axiosClient.get('/agents', { params: { page, per_page: 20 } })
      .then(({ data }) => {
        setAgents(data.data || []);
        setMeta({ current_page: data.meta?.current_page || 1, last_page: data.meta?.last_page || 1 });
      })
      .catch((err) => setError(apiError(err, 'Could not load agents.')))
      .finally(() => setLoading(false));
  };

  useEffect(getAgents, [page]);  

  const openRemove = (agent) => {
    setRemoving(agent);
    setReassignTo('');
    setRemoveError('');
    axiosClient.get('/agents', { params: { per_page: 100 } })
      .then(({ data }) => setAllAgents((data.data || []).filter((a) => a.id !== agent.id && a.is_active)))
      .catch(() => setAllAgents([]));
  };

  const confirmRemove = () => {
    setRemoveError('');
    axiosClient.delete(`/admin/agents/${removing.id}`, { data: reassignTo ? { reassign_to: Number(reassignTo) } : {} })
      .then(() => {
        setNotification(`${removing.name} was removed${reassignTo ? ' and their listings reassigned' : ''}.`);
        setRemoving(null);
        getAgents();
      })
      .catch((err) => setRemoveError(apiError(err)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agents</h1>
          <p className="text-slate-500">The agents listings and viewings are assigned to.</p>
        </div>
        <Button as={Link} to="/users/new" className="flex items-center gap-2">
          <FaPlus aria-hidden /> Add Agent
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">Agent</TableCell>
              <TableCell as="th">Contact Info</TableCell>
              <TableCell as="th">Listings</TableCell>
              <TableCell as="th">Status</TableCell>
              <TableCell as="th" className="text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading agents...</TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">No agents yet. Create a user with the Agent role.</TableCell>
              </TableRow>
            ) : (
              agents.map(agent => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200" aria-hidden>
                        {agent.name?.charAt(0).toUpperCase() || <FaUserTie />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{agent.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">ID: #{agent.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FaEnvelope className="text-slate-400 text-xs" aria-hidden /> {agent.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FaPhone className="text-slate-400 text-xs" aria-hidden /> {agent.phone || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <FaBuilding className="text-primary" aria-hidden />
                      {agent.listings_count ?? 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.is_active
                      ? <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                      : <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">Inactive</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/users/${agent.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg" aria-label={`Edit ${agent.name}`} title="Edit">
                        <FaEdit />
                      </Link>
                      <button type="button" onClick={() => openRemove(agent)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" aria-label={`Remove ${agent.name}`} title="Remove">
                        <FaTrash />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination currentPage={meta.current_page} totalPages={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={!!removing} onClose={() => setRemoving(null)} title={removing ? `Remove ${removing.name}?` : ''}>
        {removing && (
          <div className="space-y-4 text-sm">
            {removeError && <div className="p-3 bg-red-50 text-red-700 rounded-lg" role="alert">{removeError}</div>}
            <p className="text-slate-600">
              They will be signed out and can no longer log in. Past transactions keep their name.
            </p>
            {(removing.listings_count ?? 0) > 0 && (
              <label className="block">
                <span className="block font-medium text-slate-700 mb-1">
                  Hand over their {removing.listings_count} listing(s) and open viewings to
                </span>
                <select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white" required>
                  <option value="">Choose an agent…</option>
                  {allAgents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setRemoving(null)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={confirmRemove}
                disabled={(removing.listings_count ?? 0) > 0 && !reassignTo}
              >
                Remove agent
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
