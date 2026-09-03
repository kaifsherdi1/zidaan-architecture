import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import SellProperty from './pages/SellProperty';
import Services from './pages/Services';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Team from './pages/Team';
import TeamMember from './pages/TeamMember';
import About from './pages/About';
import Careers from './pages/Careers';
import Journal from './pages/Journal';
import JournalPost from './pages/JournalPost';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import SavedProperties from './pages/SavedProperties';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Properties */}
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/buy" element={<Properties preset="sale" />} />
      <Route path="/rent" element={<Properties preset="rent" />} />
      <Route path="/sell" element={<SellProperty />} />

      {/* Studio */}
      <Route path="/services" element={<Services />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/agents/:id" element={<AgentDetail />} />
      <Route path="/team" element={<Team />} />
      <Route path="/team/:id" element={<TeamMember />} />
      <Route path="/about" element={<About />} />
      <Route path="/careers" element={<Careers />} />

      {/* Journal */}
      <Route path="/journal" element={<Journal />} />
      <Route path="/journal/:slug" element={<JournalPost />} />

      {/* Support */}
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Account */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedProperties /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
