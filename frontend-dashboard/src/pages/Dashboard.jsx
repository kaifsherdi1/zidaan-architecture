import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import {
  FaBuilding,
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import axiosClient from "../axios-client";
import Card from "../components/ui/Card";

export default function Dashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    users: 0,
    bookings: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Dummy data for charts - replace with API data later
  const data = [
    { name: 'Jan', bookings: 4, revenue: 2400 },
    { name: 'Feb', bookings: 3, revenue: 1398 },
    { name: 'Mar', bookings: 2, revenue: 9800 },
    { name: 'Apr', bookings: 2, revenue: 3908 },
    { name: 'May', bookings: 1, revenue: 4800 },
    { name: 'Jun', bookings: 2, revenue: 3800 },
    { name: 'Jul', bookings: 3, revenue: 4300 },
  ];

  useEffect(() => {
    // Fetch dashboard stats from API
    // axiosClient.get('/admin/dashboard').then(({ data }) => setStats(data));
    // Simulating loading for now
    setTimeout(() => {
      setStats({
        properties: 124,
        users: 850,
        bookings: 45,
        revenue: 125000
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`text-xl ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
          {Math.abs(trend)}%
        </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={stats.properties}
          icon={FaBuilding}
          color="bg-blue-500 text-blue-500"
          trend={12}
        />
        <StatCard
          title="Active Users"
          value={stats.users}
          icon={FaUsers}
          color="bg-green-500 text-green-500" // Using primary color visually
          trend={5}
        />
        <StatCard
          title="Total Bookings"
          value={stats.bookings}
          icon={FaCalendarCheck}
          color="bg-purple-500 text-purple-500"
          trend={-2}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={FaMoneyBillWave}
          color="bg-yellow-500 text-yellow-500"
          trend={8}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Analytics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#76b0ab" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#76b0ab" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#76b0ab' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#76b0ab" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Booking Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="bookings" fill="#76b0ab" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}


