import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyForm from "./pages/PropertyForm";
import Users from "./pages/Users";
import UserForm from "./pages/UserForm";
import Bookings from "./pages/Bookings";
import Transactions from "./pages/Transactions";
import Agents from "./pages/Agents";
import Enquiries from "./pages/Enquiries";
import ActivityLog from "./pages/ActivityLog";
import Profile from "./pages/Profile";
import DefaultLayout from "./layouts/DefaultLayout";
import GuestLayout from "./layouts/GuestLayout";
import RequireRole from "./components/RequireRole";

const OFFICE = ['admin', 'manager'];
const office = (element) => <RequireRole roles={OFFICE}>{element}</RequireRole>;

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/properties', element: <Properties /> },
      { path: '/properties/new', element: office(<PropertyForm key="propertyCreate" />) },
      { path: '/properties/:id', element: office(<PropertyForm key="propertyView" />) },
      { path: '/properties/:id/edit', element: office(<PropertyForm key="propertyEdit" />) },
      { path: '/users', element: office(<Users />) },
      { path: '/users/new', element: office(<UserForm key="userCreate" />) },
      { path: '/users/:id', element: office(<UserForm key="userEdit" />) },
      { path: '/bookings', element: <Bookings /> },
      { path: '/agents', element: office(<Agents />) },
      { path: '/enquiries', element: office(<Enquiries />) },
      { path: '/activity', element: <RequireRole roles={['admin']}><ActivityLog /></RequireRole> },
      { path: '/transactions', element: <Transactions /> },
      { path: '/profile', element: <Profile /> },
    ]
  },
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      { path: '/login', element: <Login /> }
    ]
  },
  { path: '*', element: <Navigate to="/login" /> }
]);

export default router;
