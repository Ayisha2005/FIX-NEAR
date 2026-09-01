import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import SideAIChatbox from './components/SideAIChatbox';

import Home from './pages/Home';
import Search from './pages/Search';
import ProviderProfile from './pages/ProviderProfile';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PremiumSubscription from './pages/PremiumSubscription';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/providers/:id" element={<ProviderProfile />} />
              <Route path="/subscribe" element={<PremiumSubscription />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Dashboard */}
              <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              </Route>

              {/* Provider Dashboard */}
              <Route element={<ProtectedRoute allowedRoles={['provider', 'admin']} />}>
                <Route path="/provider-dashboard" element={<ProviderDashboard />} />
              </Route>

              {/* Admin Dashboard */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Right Edge Collapsible Google AI Side Chatbox */}
          <SideAIChatbox />

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
