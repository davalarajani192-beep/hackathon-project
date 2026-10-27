import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, role, switchDemoRole } = useAuth();
  const [activePage, setActivePage] = useState('landing');

  // If user role changes, navigate to their dashboard automatically
  useEffect(() => {
    if (user && activePage === 'login') {
      if (user.role === 'donor') setActivePage('donor');
      else if (user.role === 'receiver') setActivePage('receiver');
      else setActivePage('admin');
    }
  }, [user]);

  const renderContent = () => {
    // 1. Public Pages
    if (activePage === 'landing') {
      return <LandingPage setActivePage={setActivePage} />;
    }
    if (activePage === 'login') {
      return <LoginPage setActivePage={setActivePage} />;
    }
    if (activePage === 'register') {
      return <RegisterPage setActivePage={setActivePage} />;
    }

    // 2. Role-Enforced Protected Pages
    if (activePage === 'donor') {
      if (!user) {
        return <LoginPage setActivePage={setActivePage} />;
      }
      if (role !== 'donor' && role !== 'admin') {
        return (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-soft text-center space-y-4 border border-amber-200">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-black text-[#14402F]">Role Access Restricted</h2>
            <p className="text-xs text-gray-600">
              The Donor Dashboard is restricted to registered commercial food donors (canteens, banquet halls, grocers). Your current role is <strong>{role}</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { switchDemoRole('donor'); }}
                className="w-full py-2.5 rounded-xl bg-[#3E8E6A] text-white font-bold text-xs shadow-soft"
              >
                Switch to Donor Demo Role
              </button>
              <button
                onClick={() => setActivePage('landing')}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
              >
                Return to Overview
              </button>
            </div>
          </div>
        );
      }
      return <DonorDashboard />;
    }

    if (activePage === 'receiver') {
      if (!user) {
        return <LoginPage setActivePage={setActivePage} />;
      }
      if (role !== 'receiver' && role !== 'admin') {
        return (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-soft text-center space-y-4 border border-amber-200">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-black text-[#14402F]">Role Access Restricted</h2>
            <p className="text-xs text-gray-600">
              The Receiver Dashboard is reserved for verified food relief organizations (food banks, community kitchens, shelters). Your current role is <strong>{role}</strong>.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { switchDemoRole('receiver'); }}
                className="w-full py-2.5 rounded-xl bg-[#2E86AB] text-white font-bold text-xs shadow-soft"
              >
                Switch to Receiver Demo Role
              </button>
              <button
                onClick={() => setActivePage('landing')}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
              >
                Return to Overview
              </button>
            </div>
          </div>
        );
      }
      return <ReceiverDashboard />;
    }

    if (activePage === 'admin') {
      return <AdminDashboard />;
    }

    return <LandingPage setActivePage={setActivePage} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9]">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
