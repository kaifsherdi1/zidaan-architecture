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
import Profile from "./pages/Profile";
import DefaultLayout from "./layouts/DefaultLayout";
import GuestLayout from "./layouts/GuestLayout";

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" />
      },
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/properties',
        element: <Properties />
      },
      {
        path: '/properties/new',
        element: <PropertyForm key="propertyCreate" />
      },
      {
        path: '/properties/:id',
        element: <PropertyForm key="propertyView" />
      },
      {
        path: '/properties/:id/edit',
        element: <PropertyForm key="propertyEdit" />
      },
      {
        path: '/users',
        element: <Users />
      },
      {
        path: '/users/new',
        element: <UserForm key="userCreate" />
      },
      {
        path: '/users/:id',
        element: <UserForm key="userEdit" />
      },
      {
        path: '/bookings',
        element: <Bookings />
      },
      {
        path: '/agents',
        element: <Agents />
      },
      {
        path: '/transactions',
        element: <Transactions />
      },
      {
        path: '/profile',
        element: <Profile />
      }
    ]
  },
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      {
        path: '/login',
        element: <Login />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/login" />
  }
]);

export default router;
