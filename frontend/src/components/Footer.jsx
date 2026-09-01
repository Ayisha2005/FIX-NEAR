import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Shield, Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl gradient-bg p-2 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                HomeServe <span className="gradient-text">Connect</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting homeowners with certified, top-rated local home service professionals across the nation.
            </p>
            <div className="flex items-center space-x-2 text-xs text-purple-400 font-semibold bg-purple-950/40 px-3 py-1.5 rounded-full border border-purple-800/40 w-fit">
              <Shield className="w-3.5 h-3.5" /> Verified Professionals Only
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-purple-400 transition-colors">Home</Link></li>
              <li><Link to="/search" className="hover:text-purple-400 transition-colors">Find Local Services</Link></li>
              <li><Link to="/subscribe" className="hover:text-purple-400 transition-colors">Premium Contact Pass</Link></li>
              <li><Link to="/register?role=provider" className="hover:text-purple-400 transition-colors">Join as a Service Provider</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Popular Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/search?category_id=1" className="hover:text-purple-400 transition-colors">Plumbing & Pipe Repair</Link></li>
              <li><Link to="/search?category_id=2" className="hover:text-purple-400 transition-colors">Electrical & Wiring</Link></li>
              <li><Link to="/search?category_id=3" className="hover:text-purple-400 transition-colors">HVAC Climate Control</Link></li>
              <li><Link to="/search?category_id=4" className="hover:text-purple-400 transition-colors">Home Cleaning & Hygiene</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>support@homeserveconnect.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <span>+1 (800) 555-SERVE</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>New York HQ, 100 Park Ave</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0">
          <p>© 2026 HomeServe Connect Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
