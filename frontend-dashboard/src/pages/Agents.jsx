
import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { Table, TableHead, TableBody, TableRow, TableCell } from "../components/ui/Table";
import Card from "../components/ui/Card";
import { FaUserTie, FaEnvelope, FaPhone, FaAward } from "react-icons/fa";

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAgents();
  }, []);

  const getAgents = () => {
    setLoading(true);
    axiosClient.get('/agents')
      .then(({ data }) => {
        setLoading(false);
        setAgents(data.data || []);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agents</h1>
          <p className="text-slate-500">View and manage real estate agents.</p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as="th">Agent</TableCell>
              <TableCell as="th">Contact Info</TableCell>
              <TableCell as="th">Specialization</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">Loading agents...</TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">No agents found.</TableCell>
              </TableRow>
            ) : (
              agents.map(agent => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                        {agent.user?.name?.charAt(0).toUpperCase() || <FaUserTie />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{agent.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">ID: #{agent.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FaEnvelope className="text-slate-400 text-xs" /> {agent.user?.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FaPhone className="text-slate-400 text-xs" /> {agent.phone || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <FaAward className="text-primary" />
                      {agent.specialization || 'General Real Estate'}
                    </div>
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

