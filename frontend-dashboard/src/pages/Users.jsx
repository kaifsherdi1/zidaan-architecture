import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios-client";
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaUserTie, FaUser, FaSearch, FaUndo } from "react-icons/fa";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import { useStateContext } from "../contexts/ContextProvider";
import { apiError, roleOf } from "../utils/auth";

const ROLE_STYLE = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-orange-100 text-orange-700',
  agent: 'bg-blue-100 text-blue-700',
  user: 'bg-slate-100 text-slate-700',
};
const ROLE_ICON = { admin: FaUserShield, manager: FaUserTie, agent: FaUserTie, user: FaUser };

export default function Users() {
  const { user: me, setNotification } = useStateContext();
  const iAmAdmin = roleOf(me) === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [trashed, setTrashed] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const getUsers = () => {
    setLoading(true);
    setError('');
    axiosClient.get('/admin/users', {
      params: { page: currentPage, search: query || undefined, role: role || undefined, trashed: trashed ? 1 : undefined },
    })
      .then(({ data }) => {
        setUsers(data.data || []);
        setTotalPages(data.meta?.last_page || 1);
        setTotal(data.meta?.total || 0);
      })
      .catch((err) => setError(apiError(err, 'Could not load users.')))
      .finally(() => setLoading(false));
  };

  useEffect(getUsers, [currentPage, query, role, trashed]);  

  // Managers may only manage agent and client accounts (the API enforces this too).
  const canManage = (u) => iAmAdmin || ['agent', 'user'].includes(roleOf(u));

  const handleDelete = () => {
    axiosClient.delete(`/admin/users/${userToDelete.id}`)
      .then(() => {
        setNotification(`${userToDelete.name} was moved to trash and signed out.`);
        getUsers();
      })
      .catch((err) => setNotification(apiError(err)))
      .finally(() => setUserToDelete(null));
  };

  const handleRestore = (u) => {
    axiosClient.post(`/admin/users/${u.id}/restore`)
      .then(() => {
        setNotification(`${u.name} was restored.`);
        getUsers();
      })
      .catch((err) => setNotification(apiError(err)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500">Manage user access and roles.</p>
        </div>
        <Button as={Link} to="/users/new" className="flex items-center gap-2">
          <FaPlus aria-hidden />
          Add User
        </Button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">{error}</div>}

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 justify-between md:items-center">
          <form
            className="relative w-full md:w-72"
            onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); setQuery(search.trim()); }}
          >
            <label htmlFor="user-search" className="sr-only">Search users</label>
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              id="user-search"
              type="search"
              placeholder="Search name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </form>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-600 flex items-center gap-2">
              Role
              <select value={role} onChange={(e) => { setRole(e.target.value); setCurrentPage(1); }} className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white">
                <option value="">All</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
                <option value="user">Client</option>
              </select>
            </label>
            <label className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={trashed} onChange={(e) => { setTrashed(e.target.checked); setCurrentPage(1); }} />
              Show trash
            </label>
            <span className="text-sm text-slate-400">{total} found</span>
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">User</TableCell>
              <TableCell as="th">Role</TableCell>
              <TableCell as="th">Status</TableCell>
              <TableCell as="th" className="hidden md:table-cell">Joined</TableCell>
              <TableCell as="th" className="text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading users...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map(u => {
                const slug = roleOf(u) || 'user';
                const RoleIcon = ROLE_ICON[slug] || FaUser;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shrink-0" aria-hidden>
                          {(u.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{u.name}{u.id === me?.id && <span className="text-xs text-slate-400"> (you)</span>}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email || u.phone || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_STYLE[slug] || ROLE_STYLE.user}`}>
                        <RoleIcon aria-hidden />
                        {slug === 'user' ? 'Client' : u.role?.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {trashed ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Deleted</span>
                      ) : u.is_active ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManage(u) && (
                        <div className="flex items-center justify-end gap-2">
                          {trashed ? (
                            <button type="button" onClick={() => handleRestore(u)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg" aria-label={`Restore ${u.name}`} title="Restore">
                              <FaUndo />
                            </button>
                          ) : (
                            <>
                              <Link to={`/users/${u.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors" aria-label={`Edit ${u.name}`} title="Edit">
                                <FaEdit />
                              </Link>
                              {u.id !== me?.id && (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  aria-label={`Delete ${u.name}`}
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-slate-100">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </Card>

      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Delete User">
        <p className="text-slate-600 mb-6">
          Move <strong>{userToDelete?.name}</strong> to trash? They are signed out immediately and can no longer log in.
          You can restore the account from <em>Show trash</em>.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setUserToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete User</Button>
        </div>
      </Modal>
    </div>
  );
}
