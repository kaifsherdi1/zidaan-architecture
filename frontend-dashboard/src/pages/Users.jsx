import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios-client";
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaUserTie, FaUser, FaSearch } from "react-icons/fa";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers(currentPage);
  }, [currentPage]);

  const getUsers = (page) => {
    setLoading(true);
    axiosClient.get(`/admin/users?page=${page}`)
      .then(({ data }) => {
        setLoading(false);
        // Handle both paginated and non-paginated responses
        if (data.meta) {
          setUsers(data.data);
          setTotalPages(data.meta.last_page);
        } else if (Array.isArray(data.data)) {
          setUsers(data.data);
          setTotalPages(1);
        } else {
          setUsers([]);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!userToDelete) return;

    axiosClient.delete(`/admin/users/${userToDelete.id}`)
      .then(() => {
        setNotification("User was successfully deleted");
        setDeleteModalOpen(false);
        getUsers(currentPage);
        setTimeout(() => setNotification(""), 3000);
      })
      .catch((err) => {
        console.error(err);
        setDeleteModalOpen(false);
      });
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500">Manage user access and roles.</p>
        </div>
        <Button as={Link} to="/users/new" className="flex items-center gap-2">
          <FaPlus />
          Add User
        </Button>
      </div>

      {notification && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fadeIn">
          {notification}
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">User</TableCell>
              <TableCell as="th">Role</TableCell>
              <TableCell as="th">Status</TableCell>
              <TableCell as="th">Joined</TableCell>
              <TableCell as="th" className="text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading users...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">No users found.</TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const roleName = typeof user.role === 'object' ? user.role.slug : (user.role || 'user');
                        const roleLabel = typeof user.role === 'object' ? user.role.name : (user.role || 'User');
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize 
                            ${roleName === 'admin' ? 'bg-purple-100 text-purple-700' :
                              roleName === 'manager' ? 'bg-orange-100 text-orange-700' :
                                roleName === 'agent' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-700'}`}>
                            {roleName === 'admin' && <FaUserShield />}
                            {roleName === 'manager' && <FaUserTie />}
                            {roleName === 'agent' && <FaUserTie />}
                            {roleName === 'user' && <FaUser />}
                            {roleLabel}
                          </span>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Active
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/users/${user.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors">
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => confirmDelete(user)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
      >
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete User</Button>
        </div>
      </Modal>
    </div>
  );
}

