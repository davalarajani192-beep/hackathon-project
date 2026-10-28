import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MapView from '../components/MapView';
import CountdownTimer from '../components/CountdownTimer';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Send, 
  Navigation, 
  Building2, 
  Utensils, 
  Phone, 
  Sparkles,
  Check
} from 'lucide-react';
import L from 'leaflet';

export default function LiveTrackingPage({ setActivePage, selectedListingId = null }) {
  const { user, role } = useAuth();
  const [activeListing, setActiveListing] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Simulated live delivery coordinates along route
  const [vehicleProgress, setVehicleProgress] = useState(0.45); // 0.0 (Donor) to 1.0 (Receiver)

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const listings = await api.getListings();
      setAllListings(listings);

      // Find an active claimed or delivered listing to track
      let target = null;
      if (selectedListingId) {
        target = listings.find(l => l.id === selectedListingId);
      }
      if (!target) {
        // Find first listing in Accepted, Collected, or Verified status
        target = listings.find(l => ['Accepted', 'Collected', 'Verified'].includes(l.status)) || listings[0];
      }
      setActiveListing(target);

      if (target) {
        const msgs = await api.getMessages(target.id);
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, [selectedListingId]);

  // Periodic polling for real-time messages & tracking stage
  useEffect(() => {
    if (!activeListing) return;
    const interval = setInterval(async () => {
      try {
        const [updatedItem, msgs] = await Promise.all([
          api.getListingById(activeListing.id),
          api.getMessages(activeListing.id)
        ]);
        setActiveListing(updatedItem);
        setMessages(msgs);
      } catch (e) {
        // silent fail on poll
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeListing?.id]);

  // Progress driver simulation
  useEffect(() => {
    if (!activeListing) return;
    if (activeListing.status === 'Verified' || activeListing.status === 'Collected') {
      setVehicleProgress(1.0);
    } else {
      const timer = setInterval(() => {
        setVehicleProgress(prev => (prev >= 0.95 ? 0.35 : prev + 0.05));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activeListing?.status]);

  // Handle Receiver clicking "Food Received"
  const handleConfirmReceived = async () => {
    if (!activeListing) return;
    setActionLoading(true);
    try {
      const updated = await api.confirmDelivery(activeListing.id);
      setActiveListing(updated);
      setVehicleProgress(1.0);
      setNotification(`Delivery Confirmed! Confirmation message and delivery receipt sent to donor (${updated.donor_name}).`);
      const msgs = await api.getMessages(activeListing.id);
      setMessages(msgs);
    } catch (err) {
      alert(err.message || 'Error confirming delivery');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Donor confirming final handover verification
  const handleDonorVerify = async () => {
    if (!activeListing) return;
    setActionLoading(true);
    try {
      const updated = await api.verifyCollection(activeListing.id);
      setActiveListing(updated);
      setNotification('Handover officially verified! Double-confirmation completed & logged.');
      const msgs = await api.getMessages(activeListing.id);
      setMessages(msgs);
    } catch (err) {
      alert(err.message || 'Error verifying');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeListing) return;
    try {
      const sent = await api.sendMessage(activeListing.id, newMessage.trim());
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message');
    }
  };

  // Coordinates calculation for route
  const donorLat = activeListing?.latitude || 17.4239;
  const donorLng = activeListing?.longitude || 78.4611;
  const receiverLat = activeListing?.claimed_by_lat || 17.4385;
  const receiverLng = activeListing?.claimed_by_lng || 78.4554;

  const currentVehicleLat = donorLat + (receiverLat - donorLat) * vehicleProgress;
  const currentVehicleLng = donorLng + (receiverLng - donorLng) * vehicleProgress;

  const trackingStages = [
    { title: 'Food Ready at Donor', detail: 'Packed & ready at donor kitchen', done: true },
    { title: 'Driver Dispatched', detail: 'Vehicle en route to pickup location', done: ['Accepted', 'Collected', 'Verified'].includes(activeListing?.status) },
    { title: 'Food Picked Up', detail: 'Loaded into insulated transport', done: ['Collected', 'Verified'].includes(activeListing?.status) || vehicleProgress >= 0.5 },
    { title: 'In Transit', detail: 'Heading towards community food bank', done: ['Collected', 'Verified'].includes(activeListing?.status) || vehicleProgress >= 0.8 },
    { title: 'Delivered & Received', detail: 'Food arrived & inspected by receiver', done: ['Collected', 'Verified'].includes(activeListing?.status) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 bg-[#F0922B]/10 text-[#F0922B] rounded-full flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" /> Live Transit & Handover Verification
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-[#3E8E6A]">Last Bite Live Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14402F] mt-1">
            Real-Time Food Delivery & Receipt
          </h1>
          <p className="text-xs text-gray-500">
            Monitor real-time transit between donor and receiver, confirm receipt upon delivery, and view the instant donor notification.
          </p>
        </div>

        {/* Listing Selector if multiple */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-600 hidden sm:inline">Select Delivery:</label>
          <select
            value={activeListing?.id || ''}
            onChange={(e) => {
              const found = allListings.find(l => l.id === parseInt(e.target.value));
              if (found) setActiveListing(found);
            }}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-[#EDF3EF] text-[#14402F] focus:ring-[#3E8E6A]"
          >
            {allListings.map(l => (
              <option key={l.id} value={l.id}>
                #{l.id}: {l.title.slice(0, 30)} ({l.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Live Map & Status on Left, Messaging & Actions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Route Map & Delivery Stepper */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Listing Details Card */}
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#EDF3EF] text-[#3E8E6A] rounded-md">
                    {activeListing?.category || 'Cooked Meals'}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-[#2E86AB] rounded-md capitalize">
                    Storage: {activeListing?.storage_type || 'ambient'}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-[#F0922B]/10 text-[#F0922B] rounded-full">
                    {activeListing?.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#14402F] pt-1">
                  {activeListing?.title}
                </h2>
                <p className="text-xs text-gray-500">
                  {activeListing?.quantity} {activeListing?.unit} • Dietary: {activeListing?.dietary_info}
                </p>
              </div>

              {activeListing && (
                <CountdownTimer expiryTime={activeListing.expiry_time} compact />
              )}
            </div>

            {/* Origin & Destination Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#EDF3EF]/70 rounded-2xl border border-[#3E8E6A]/20 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#3E8E6A]" /> Food Donor (Origin)
                </span>
                <p className="font-extrabold text-[#14402F]">{activeListing?.donor_name}</p>
                <p className="text-[11px] text-gray-600 truncate">{activeListing?.pickup_address}</p>
                <p className="text-[10px] text-gray-400 font-mono">
                  GPS: {donorLat.toFixed(4)}, {donorLng.toFixed(4)}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-gray-200 sm:pl-3">
                <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-[#2E86AB]" /> Receiver Hub (Destination)
                </span>
                <p className="font-extrabold text-[#2E86AB]">
                  {activeListing?.claimed_by_name || 'City Hope Food Bank'}
                </p>
                <p className="text-[11px] text-gray-600 truncate">
                  {activeListing?.claimed_by_address || 'Greenlands Road, Begumpet, Hyderabad'}
                </p>
                <p className="text-[10px] text-gray-400 font-mono">
                  GPS: {receiverLat.toFixed(4)}, {receiverLng.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Live Interactive Map with Moving Driver */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#14402F] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#F0922B] animate-bounce" /> Live Driver GPS Route
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {activeListing?.status === 'Verified' || activeListing?.status === 'Collected'
                    ? '✓ Arrived at destination'
                    : `In Transit (~${Math.max(4, Math.round(18 * (1 - vehicleProgress)))} mins remaining)`}
                </span>
              </div>

              <div className="h-[360px] rounded-2xl overflow-hidden border border-[#3E8E6A]/20 relative shadow-inner">
                <MapView
                  center={[
                    (donorLat + receiverLat) / 2,
                    (donorLng + receiverLng) / 2
                  ]}
                  zoom={13}
                  listings={[
                    {
                      id: 101,
                      latitude: donorLat,
                      longitude: donorLng,
                      title: `Donor: ${activeListing?.donor_name}`,
                      quantity: activeListing?.quantity,
                      unit: activeListing?.unit,
                      storage_type: activeListing?.storage_type,
                      status: 'Donor Location'
                    },
                    {
                      id: 102,
                      latitude: receiverLat,
                      longitude: receiverLng,
                      title: `Receiver: ${activeListing?.claimed_by_name || 'Food Bank'}`,
                      quantity: activeListing?.quantity,
                      unit: activeListing?.unit,
                      storage_type: activeListing?.storage_type,
                      status: 'Receiver Hub'
                    },
                    {
                      id: 103,
                      latitude: currentVehicleLat,
                      longitude: currentVehicleLng,
                      title: '🚚 Dispatch Runner (Live)',
                      quantity: activeListing?.quantity,
                      unit: activeListing?.unit,
                      storage_type: activeListing?.storage_type,
                      status: 'Moving Runner'
                    }
                  ]}
                  activeCircle={{
                    lat: donorLat,
                    lng: donorLng,
                    radiusKm: activeListing?.pickup_radius_km || 10,
                    label: 'Donor Radius'
                  }}
                  className="h-[360px]"
                />
              </div>
            </div>

            {/* Live Delivery Stepper */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                Transit Milestone Progress
              </h4>
              <div className="space-y-2.5">
                {trackingStages.map((stg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl flex items-center justify-between border transition ${
                      stg.done
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          stg.done ? 'bg-[#3E8E6A] text-white' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {stg.done ? '✓' : idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold">{stg.title}</p>
                        <p className="text-[11px] text-gray-500">{stg.detail}</p>
                      </div>
                    </div>
                    {stg.done && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-[#3E8E6A] rounded border border-emerald-200">
                        Completed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Handover Confirmation Actions & Instant Donor Messages */}
        <div className="lg:col-span-5 space-y-5">
          {/* ACTION PANEL: RECEIVER MARKS FOOD RECEIVED */}
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#14402F]">Delivery Handover Action</h3>
                <p className="text-xs text-gray-500">Receiver confirms arrival $\rightarrow$ Alerts donor immediately</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#EDF3EF] flex items-center justify-center text-[#3E8E6A]">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            {/* Receiver Action Button */}
            {activeListing?.status === 'Accepted' && (
              <div className="space-y-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
                <p className="text-xs text-amber-900 font-medium">
                  Has the delivery driver arrived at the food bank with the food? Click below to confirm receipt.
                </p>
                <button
                  onClick={handleConfirmReceived}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl bg-[#2E86AB] hover:bg-[#256d8a] text-white font-bold text-xs shadow-soft transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoading ? 'Confirming...' : 'Mark Food Received & Inspected (Receiver)'}</span>
                </button>
                <p className="text-[11px] text-gray-500 text-center italic">
                  This sends an automated delivery receipt message to the donor kitchen.
                </p>
              </div>
            )}

            {/* Donor Verification Confirmation */}
            {activeListing?.status === 'Collected' && (
              <div className="space-y-3 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Check className="w-4 h-4" /> Receiver confirmed food was safely received!
                </div>
                <p className="text-xs text-gray-600">
                  As the food donor, confirm the handover inspection to complete double-verification.
                </p>
                <button
                  onClick={handleDonorVerify}
                  disabled={actionLoading}
                  className="w-full py-3.5 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-xs shadow-soft transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{actionLoading ? 'Finalizing...' : 'Confirm Handover & Finalize Verification (Donor)'}</span>
                </button>
              </div>
            )}

            {activeListing?.status === 'Verified' && (
              <div className="p-4 bg-[#EDF3EF] rounded-2xl border border-[#3E8E6A]/30 text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#3E8E6A] text-white flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-sm font-black text-[#14402F]">Double-Handshake Completed!</p>
                <p className="text-xs text-gray-600">
                  Mutual confirmation complete. <strong>{activeListing?.quantity} {activeListing?.unit}</strong> logged into municipal diversion metrics.
                </p>
              </div>
            )}
          </div>

          {/* REAL-TIME NOTIFICATION & MESSAGE STREAM */}
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#3E8E6A]" />
                  <h3 className="text-base font-black text-[#14402F]">Donor-Receiver Message Stream</h3>
                </div>
                <p className="text-xs text-gray-500">Live confirmation receipts & logistics notes</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                Live Receipt Alert
              </span>
            </div>

            {/* Message Thread */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 italic">
                  No messages yet. When receiver confirms delivery, an automatic message will appear here!
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isConfirmation = m.message_text.includes('FOOD RECEIVED CONFIRMATION') || m.message_text.includes('Claim Notification');
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 border ${
                        isConfirmation
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs'
                          : 'bg-[#EDF3EF]/60 border-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-[#14402F] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#F0922B]" /> {m.sender_name}
                        </span>
                        <span className="text-gray-400 font-mono">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{m.message_text}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send Message Input */}
            <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Send a dispatch note or gate code..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#14402F] hover:bg-[#0D2B20] text-white shadow-soft transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
