import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { FaFileExcel, FaDownload, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

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

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useStateContext();

  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : (user?.role || '');
  const isStaffAdmin = roleSlug === 'admin' || roleSlug === 'manager';

  const fetchTransactions = () => {
    setLoading(true);
    const endpoint = isStaffAdmin ? '/admin/transactions' : '/agent/transactions';

    axiosClient.get(endpoint)
      .then(({ data }) => {
        setTransactions(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (roleSlug) fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleSlug]);

  const handleDownloadInvoice = (id) => {
    downloadBlob(`/admin/transactions/${id}/invoice`, `invoice-${id}.pdf`).catch(() => {});
  };

  const handleExport = () => {
    downloadBlob('/admin/reports/transactions', 'transactions.xlsx').catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-500">View and manage financial records and invoices.</p>
        </div>
        {isStaffAdmin && (
          <Button variant="secondary" onClick={handleExport} className="flex items-center gap-2">
            <FaFileExcel className="text-green-600" /> Export Excel
          </Button>
        )}
      </div>

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
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-900">{transaction.client_name}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-slate-900">₹{Number(transaction.amount).toLocaleString('en-IN')}</span>
                  </TableCell>
                  <TableCell>
                    {transaction.transaction_date || new Date(transaction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {transaction.status === 'completed' && <FaCheckCircle className="text-xs" />}
                      {transaction.status === 'pending' && <FaClock className="text-xs" />}
                      {transaction.status === 'cancelled' && <FaTimesCircle className="text-xs" />}
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {isStaffAdmin && (
                      <button
                        onClick={() => handleDownloadInvoice(transaction.id)}
                        className="text-primary hover:text-primary-dark font-medium text-sm inline-flex items-center gap-1 transition-colors"
                      >
                        <FaDownload className="text-xs" /> Invoice
                      </button>
                    )}
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
