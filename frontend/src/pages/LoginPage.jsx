import React, { useState } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Utensils, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { login, switchDemoRole, loading } = useAuth();
  const [email, setEmail] = useState('donor@canteen.org');
  const [password, setPassword] = useState('donor123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'donor') setActivePage('donor');
      else if (user.role === 'receiver') setActivePage('receiver');
      else setActivePage('admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleQuickDemo = (roleKey) => {
    switchDemoRole(roleKey);
    setActivePage(roleKey);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAF9]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-gray-100">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#14402F] text-white flex items-center justify-center mx-auto shadow-sm">
            <Utensils className="w-6 h-6 text-[#3E8E6A]" />
          </div>
          <h2 className="text-2xl font-black text-[#14402F]">Sign in to EASY</h2>
          <p className="text-xs text-gray-500 italic">"Surplus today. A meal tonight."</p>
        </div>

        {/* Quick Demo Selector */}
        <div className="p-3.5 bg-[#EDF3EF] rounded-2xl border border-[#3E8E6A]/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#14402F]">
            <Sparkles className="w-3.5 h-3.5 text-[#F0922B]" />
            <span>1-Click Hackathon Evaluator Login:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('donor')}
              className="py-1.5 px-2 bg-white hover:bg-[#3E8E6A] hover:text-white text-[#14402F] rounded-xl text-[11px] font-bold border border-gray-200 transition shadow-xs text-center"
            >
              🍳 Donor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('receiver')}
              className="py-1.5 px-2 bg-white hover:bg-[#3E8E6A] hover:text-white text-[#14402F] rounded-xl text-[11px] font-bold border border-gray-200 transition shadow-xs text-center"
            >
              📦 Receiver
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-[#2E86AB] hover:text-white text-[#14402F] rounded-xl text-[11px] font-bold border border-gray-200 transition shadow-xs text-center"
            >
              📊 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A] focus:border-transparent"
                placeholder="name@organization.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#14402F] hover:bg-[#0D2B20] text-white font-bold text-sm shadow-soft transition flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Don't have an account yet?{' '}
          <button
            onClick={() => setActivePage('register')}
            className="font-bold text-[#3E8E6A] hover:underline"
          >
            Create an EASY account
          </button>
        </div>
      </div>
    </div>
  );
}
