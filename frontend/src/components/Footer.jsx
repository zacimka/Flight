import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 px-6 mt-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-12">

        {/* Logo / Brand */}
        <div className="flex-1 min-w-[280px]">
          <h2 className="text-3xl font-black tracking-tighter mb-4 text-blue-500">ZamGo Travel</h2>
          <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
            Experience the world without boundaries. Book flights globally with our advanced booking engine, best price guarantees, and premium support.
          </p>
          <div className="flex gap-4 mt-6">
            <span className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-600 transition cursor-pointer">FB</span>
            <span className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-blue-400 transition cursor-pointer">TW</span>
            <span className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-rose-500 transition cursor-pointer">IG</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex-1 min-w-[200px]">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Explore</h4>
          <ul className="space-y-4 font-bold text-slate-300">
            <li><Link to="/" className="hover:text-blue-500 transition">Flight Search</Link></li>
            <li><Link to="/results" className="hover:text-blue-500 transition">Featured Routes</Link></li>
            <li><Link to="/dashboard" className="hover:text-blue-500 transition">My Bookings</Link></li>
            <li><Link to="/agent" className="hover:text-blue-500 transition">Agent Portal</Link></li>
            <li><Link to="/about" className="hover:text-blue-500 transition">About ZamGo Travel</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="flex-1 min-w-[200px]">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Support</h4>
          <ul className="space-y-4 font-bold text-slate-300">
            <li><Link to="/contact" className="hover:text-blue-500 transition">Contact Us</Link></li>
            <li className="hover:text-blue-500 transition cursor-pointer">Help Center</li>
            <li className="hover:text-blue-500 transition cursor-pointer">Privacy Policy</li>
            <li className="hover:text-blue-500 transition cursor-pointer">Terms of Service</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex-1 min-w-[250px] bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
          <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6 font-bold">Priority Contact</h4>
          <div className="space-y-4">
            <p className="flex items-center gap-3">
              <span className="text-blue-500">📧</span>
              <span className="text-sm font-bold text-slate-200">info@zamgotravel.com</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-blue-500">📞</span>
              <span className="text-sm font-bold text-slate-200">+44 208 044 8838</span>
            </p>
            <p className="flex items-center gap-3">
              <span className="text-blue-500">📍</span>
              <span className="text-sm font-bold text-slate-200">London, United Kingdom</span>
            </p>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm font-bold text-slate-500 tracking-tight tracking-wide uppercase">© {new Date().getFullYear()} ZamGo Travel. All rights reserved.</p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <span>Secure Payments by Stripe</span>
          <span>Global Inventory by OurAirports</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
