import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  Crown, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'provider') return '/provider-dashboard';
    return '/customer-dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl gradient-bg p-2 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform duration-300">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              HomeServe <span className="gradient-text">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="flex items-center text-sm font-semibold text-slate-200 hover:text-white transition-colors">
              <Search className="w-4 h-4 mr-1.5 text-purple-400" />
              Find Providers
            </Link>

            <Link to="/subscribe" className="flex items-center text-sm font-semibold text-slate-200 hover:text-white transition-colors">
              <Crown className="w-4 h-4 mr-1.5 text-amber-400" />
              Premium Access
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={getDashboardPath()}
                  className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white hover:bg-slate-700 transition-all flex items-center shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Dashboard
                </Link>

                <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-extrabold text-white flex items-center gap-1">
                      {user.name}
                      {user.is_premium && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Premium Subscriber" />
                      )}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white gradient-bg hover:opacity-90 transition-all shadow-md shadow-purple-600/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
