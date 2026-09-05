import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import {
  FaBuilding,
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaUserTie
} from "react-icons/fa";
import axiosClient from "../axios-client";
import Card from "../components/ui/Card";
import { useStateContext } from "../contexts/ContextProvider";

const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtINRCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1).replace(/\.0$/, '')}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1).replace(/\.0$/, '')}k`;
  return `₹${v}`;
};

export default function Dashboard() {
  const { user } = useStateContext();
  const roleSlug = typeof user?.role === 'object' ? user?.role?.slug : user?.role;
  const [kpi, setKpi] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [propertyDistribution, setPropertyDistribution] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleSlug) return;
    const endpoint = roleSlug === 'agent' ? '/agent/dashboard/stats' : '/admin/dashboard/stats';
    setLoading(true);
    axiosClient.get(endpoint)
      .then(({ data }) => {
        setKpi(data.kpi || {});
        setRevenueTrend((data.charts?.revenue_trend || []).map((r) => ({ name: r.month, revenue: Number(r.total) })));
        setPropertyDistribution(data.charts?.property_distribution || []);
        setActivity(data.recent_activity || []);
      })
      .catch(() => {
        setKpi({});
      })
      .finally(() => setLoading(false));
  }, [roleSlug]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{loading ? '—' : value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`text-xl ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </Card>
  );

  const isStaffAdmin = roleSlug === 'admin' || roleSlug === 'manager';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={roleSlug === 'agent' ? 'My Listings' : 'Total Properties'}
          value={kpi?.total_properties ?? 0}
          icon={FaBuilding}
          color="bg-blue-500 text-blue-500"
        />
        {isStaffAdmin ? (
          <StatCard title="Total Users" value={kpi?.total_users ?? 0} icon={FaUsers} color="bg-green-500 text-green-500" />
        ) : (
          <StatCard title="Pending Viewings" value={kpi?.pending_bookings ?? 0} icon={FaCalendarCheck} color="bg-purple-500 text-purple-500" />
        )}
        {isStaffAdmin ? (
          <StatCard title="Active Agents" value={kpi?.total_agents ?? 0} icon={FaUserTie} color="bg-purple-500 text-purple-500" />
        ) : (
          <StatCard title="Total Bookings" value={kpi?.total_bookings ?? 0} icon={FaCalendarCheck} color="bg-slate-500 text-slate-500" />
        )}
        <StatCard title="Revenue (Completed)" value={fmtINR(kpi?.total_revenue)} icon={FaMoneyBillWave} color="bg-yellow-500 text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue — last 6 months</h3>
          <div className="h-80">
            {revenueTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No completed transactions yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#76b0ab" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#76b0ab" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={fmtINRCompact} width={56} />
                  <Tooltip
                    formatter={(v) => fmtINR(v)}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#76b0ab" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Listings by type</h3>
          <div className="h-80">
            {propertyDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No listings yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#76b0ab" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent viewing requests</h3>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activity.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-slate-800">{a.user}</span>
                  <span className="text-slate-400"> requested </span>
                  <span className="font-medium text-slate-800">{a.property}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="capitalize text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{a.status}</span>
                  <span className="text-slate-400 text-xs">{a.date}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
