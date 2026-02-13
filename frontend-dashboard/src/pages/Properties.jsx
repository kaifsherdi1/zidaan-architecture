import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axios-client";
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaMapMarkerAlt, FaBed, FaBath,
  FaRulerCombined, FaFileExcel, FaSearch, FaTrashRestore, FaHistory,
  FaCheckSquare, FaSquare
} from "react-icons/fa";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import { useStateContext } from "../contexts/ContextProvider";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToAction, setPropertyToAction] = useState(null);
  const [actionType, setActionType] = useState('delete'); // 'delete', 'force-delete', 'restore'

  const [search, setSearch] = useState("");

  // New State for Trash and Selection
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'trash'
  const [selectedProperties, setSelectedProperties] = useState([]);

  const { user } = useStateContext();

  useEffect(() => {
    getProperties(currentPage);
    setSelectedProperties([]); // Clear selection on page/view change
  }, [currentPage, viewMode]);

  const getProperties = (page) => {
    setLoading(true);
    const params = {
      page,
      trashed: viewMode === 'trash' ? 1 : 0
    };

    axiosClient.get(`/properties`, { params })
      .then(({ data }) => {
        setLoading(false);
        if (data.meta) {
          setProperties(data.data);
          setTotalPages(data.meta.last_page);
        } else if (Array.isArray(data.data)) {
          setProperties(data.data);
          setTotalPages(1);
        } else {
          setProperties([]);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const confirmAction = (property, type) => {
    setPropertyToAction(property);
    setActionType(type);
    setDeleteModalOpen(true);
  };

  const handleAction = () => {
    if (!propertyToAction && actionType !== 'bulk-delete' && actionType !== 'bulk-restore') return;

    let promise;
    let message = "";

    if (actionType === 'delete') {
      promise = axiosClient.delete(`/properties/${propertyToAction.id}`);
      message = "Property moved to trash";
    } else if (actionType === 'force-delete') {
      promise = axiosClient.delete(`/manager/properties/${propertyToAction.id}/force`);
      message = "Property permanently deleted";
    } else if (actionType === 'restore') {
      promise = axiosClient.post(`/manager/properties/${propertyToAction.id}/restore`);
      message = "Property restored successfully";
    } else if (actionType === 'bulk-delete') {
      promise = axiosClient.post(`/manager/properties/bulk-delete`, { ids: selectedProperties });
      message = "Selected properties moved to trash";
    } else if (actionType === 'bulk-restore') {
      promise = axiosClient.post(`/manager/properties/bulk-restore`, { ids: selectedProperties });
      message = "Selected properties restored";
    }

    promise
      .then(() => {
        setNotification(message);
        setDeleteModalOpen(false);
        setPropertyToAction(null);
        setSelectedProperties([]);
        getProperties(currentPage);
        setTimeout(() => setNotification(""), 3000);
      })
      .catch((err) => {
        console.error(err);
        setDeleteModalOpen(false);
        alert("An error occurred. Please check permissions.");
      });
  };

  const toggleSelection = (id) => {
    if (selectedProperties.includes(id)) {
      setSelectedProperties(selectedProperties.filter(i => i !== id));
    } else {
      setSelectedProperties([...selectedProperties, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  };

  const onExport = () => {
    axiosClient.get('/reports/properties', {
      params: { trashed: viewMode === 'trash' ? 1 : 0 },
      responseType: 'blob'
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'properties.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
          <p className="text-slate-500">Manage real estate listings and inventory.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onExport} className="flex items-center gap-2">
            <FaFileExcel className="text-green-600" />
            Export
          </Button>
          <Button as={Link} to="/properties/new" className="flex items-center gap-2">
            <FaPlus />
            Add Property
          </Button>
        </div>
      </div>

      {notification && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fadeIn">
          {notification}
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Tabs / Filter */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'active' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode('trash')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'trash' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <FaTrash className={viewMode === 'trash' ? 'text-red-500' : 'text-slate-400'} /> Trash
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedProperties.length > 0 && (
          <div className="bg-primary/5 p-3 flex items-center justify-between animate-fadeIn">
            <span className="text-sm font-medium text-primary px-2">{selectedProperties.length} selected</span>
            <div className="flex gap-2">
              {viewMode === 'active' ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => { setActionType('bulk-delete'); setDeleteModalOpen(true); }}
                >
                  Move to Trash
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => { setActionType('bulk-restore'); setDeleteModalOpen(true); }}
                  >
                    Restore Selected
                  </Button>
                  {/* Bulk Force Delete is risky, maybe omit for now or add later */}
                </>
              )}
            </div>
          </div>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th" className="w-10">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                  checked={properties.length > 0 && selectedProperties.length === properties.length}
                  onChange={toggleSelectAll}
                />
              </TableCell>
              <TableCell as="th">Property</TableCell>
              <TableCell as="th">Type</TableCell>
              <TableCell as="th">Price</TableCell>
              <TableCell as="th">Location</TableCell>
              <TableCell as="th">Status</TableCell>
              <TableCell as="th" className="text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading properties...</TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  {viewMode === 'active' ? 'No active properties found.' : 'Trash is empty.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map(property => (
                <TableRow key={property.id} className={selectedProperties.includes(property.id) ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => toggleSelection(property.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {property.main_image ? (
                        <img src={property.main_image} alt={property.title} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                          <span className="text-xs">No Img</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{property.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><FaBed /> {property.bedrooms}</span>
                          <span className="flex items-center gap-1"><FaBath /> {property.bathrooms}</span>
                          <span className="flex items-center gap-1"><FaRulerCombined /> {property.area} sqft</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize 
                      ${property.type === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {property.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-900">${Number(property.price).toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <FaMapMarkerAlt className="text-slate-400" />
                      <span className="truncate max-w-[150px]">{property.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize 
                      ${property.status === 'available' ? 'bg-green-100 text-green-700' :
                        property.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {property.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {viewMode === 'active' ? (
                        <>
                          <Link to={`/properties/${property.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors">
                            <FaEye />
                          </Link>
                          <Link to={`/properties/${property.id}/edit`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => confirmAction(property, 'delete')}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <FaTrash />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => confirmAction(property, 'restore')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <FaTrashRestore />
                          </button>
                          <button
                            onClick={() => confirmAction(property, 'force-delete')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
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
        title={
          actionType === 'delete' ? "Move to Trash" :
            actionType === 'force-delete' ? "Delete Permanently" :
              actionType === 'restore' ? "Restore Property" :
                actionType === 'bulk-delete' ? "Move Selected to Trash" :
                  "Restore Selected"
        }
      >
        <p className="text-slate-600 mb-6">
          {actionType === 'delete' && `Are you sure you want to move "${propertyToAction?.title}" to trash?`}
          {actionType === 'force-delete' && `Are you sure you want to PERMANENTLY delete "${propertyToAction?.title}"? This action cannot be undone.`}
          {actionType === 'restore' && `Restore "${propertyToAction?.title}" from trash?`}
          {actionType === 'bulk-delete' && `Are you sure you want to move ${selectedProperties.length} items to trash?`}
          {actionType === 'bulk-restore' && `Restore ${selectedProperties.length} items from trash?`}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button
            variant={actionType.includes('delete') ? 'danger' : 'primary'}
            onClick={handleAction}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}

