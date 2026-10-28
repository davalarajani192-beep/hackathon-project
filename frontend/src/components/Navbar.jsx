import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, Shield, HeartHandshake, LogOut, Sparkles, Navigation, ListOrdered } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, role, logout, switchDemoRole } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-[#14402F] text-white border-b border-[#3E8E6A]/30 shadow-md">
      {/* Top Demo Bar for Judges / Testers */}
      <div className="bg-[#0D2B20] text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#3E8E6A]/20">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-[#F0922B] tracking-wide uppercase text-[11px]">
            <Sparkles className="w-3.5 h-3.5" /> Team Decoders Demo
          </span>
          <span className="hidden sm:inline text-[#9CC5AA]">| Switch test roles:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { switchDemoRole('donor'); setActivePage('donor'); }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
              role === 'donor'
                ? 'bg-[#3E8E6A] text-white ring-1 ring-white/30'
                : 'bg-white/10 hover:bg-white/20 text-[#9CC5AA]'
            }`}
          >
            🍳 Donor (Canteen)
          </button>
          <button
            onClick={() => { switchDemoRole('receiver'); setActivePage('receiver'); }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
              role === 'receiver'
                ? 'bg-[#2E86AB] text-white ring-1 ring-white/30'
                : 'bg-white/10 hover:bg-white/20 text-[#9CC5AA]'
            }`}
          >
            📦 Receiver (Food Bank)
          </button>
          <button
            onClick={() => { switchDemoRole('admin'); setActivePage('admin'); }}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
              role === 'admin'
                ? 'bg-amber-600 text-white ring-1 ring-white/30'
                : 'bg-white/10 hover:bg-white/20 text-[#9CC5AA]'
            }`}
          >
            📊 Admin & Audit
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand: Last Bite */}
        <div
          onClick={() => setActivePage('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#3E8E6A] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">Last Bite</span>
              <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 bg-[#EDF3EF]/15 text-[#9CC5AA] rounded-md">
                EASY • Decoders
              </span>
            </div>
            <p className="text-[11px] text-[#9CC5AA] hidden sm:block italic">
              Surplus today. A meal tonight.
            </p>
          </div>
        </div>

        {/* 5 Pages Navigation Actions */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => setActivePage('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activePage === 'landing'
                ? 'text-white bg-white/10'
                : 'text-[#9CC5AA] hover:text-white'
            }`}
          >
            1. Welcome
          </button>

          <button
            onClick={() => setActivePage('donor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activePage === 'donor'
                ? 'text-white bg-[#3E8E6A]'
                : 'text-[#9CC5AA] hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2.</span> Donor List
          </button>

          <button
            onClick={() => setActivePage('receiver')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activePage === 'receiver'
                ? 'text-white bg-[#2E86AB]'
                : 'text-[#9CC5AA] hover:text-white'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3.</span> Nearby Donors
          </button>

          <button
            onClick={() => setActivePage('tracking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activePage === 'tracking'
                ? 'text-white bg-[#F0922B]'
                : 'text-[#9CC5AA] hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">4.</span> Live Tracking
          </button>

          <button
            onClick={() => setActivePage('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activePage === 'admin'
                ? 'text-white bg-white/20'
                : 'text-[#9CC5AA] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin</span>
          </button>

          {/* User profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="hidden xl:block text-right">
                <div className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user.org_name}
                </div>
                <div className="text-[10px] text-[#F0922B] uppercase tracking-wider font-bold">
                  {user.role}
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#9CC5AA] hover:text-red-300 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActivePage('register')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F0922B] hover:bg-[#D87D1A] text-white shadow-soft transition"
            >
              Sign Up
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
