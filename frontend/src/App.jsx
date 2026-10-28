import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import ReceiverDashboard from './pages/ReceiverDashboard';
import LiveTrackingPage from './pages/LiveTrackingPage';
import AdminDashboard from './pages/AdminDashboard';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, role, switchDemoRole } = useAuth();
  const [activePage, setActivePage] = useState('landing');
  const [trackingListingId, setTrackingListingId] = useState(null);

  const handleTrackListing = (listingId) => {
    setTrackingListingId(listingId);
    setActivePage('tracking');
  };

  const renderContent = () => {
    // 1. Welcome / Landing Page (Prominent "Last Bite" with Role Selection)
    if (activePage === 'landing') {
      return <LandingPage setActivePage={setActivePage} />;
    }

    // 2. Auth Pages
    if (activePage === 'login') {
      return <LoginPage setActivePage={setActivePage} />;
    }
    if (activePage === 'register') {
      return <RegisterPage setActivePage={setActivePage} />;
    }

    // 3. Donor List Page (Enter items to donate with Expiry Date & Time, Quantity)
    if (activePage === 'donor') {
      if (!user) return <RegisterPage setActivePage={setActivePage} />;
      return <DonorDashboard setActivePage={setActivePage} onTrackListing={handleTrackListing} />;
    }

    // 4. Receiver Feed Page (Nearby Donors, Receiving Hours, Map)
    if (activePage === 'receiver') {
      if (!user) return <RegisterPage setActivePage={setActivePage} />;
      return <ReceiverDashboard setActivePage={setActivePage} onTrackListing={handleTrackListing} />;
    }

    // 5. Live Tracking Page (GPS Route, Handover Confirmation, Donor Message Receipt)
    if (activePage === 'tracking') {
      return <LiveTrackingPage setActivePage={setActivePage} selectedListingId={trackingListingId} />;
    }

    // 6. Admin Governance Dashboard
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
