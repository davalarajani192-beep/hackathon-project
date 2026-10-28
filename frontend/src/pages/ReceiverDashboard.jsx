import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import StatusStepper from '../components/StatusStepper';
import MapView from '../components/MapView';
import { 
  HeartHandshake, 
  MapPin, 
  Clock, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  ThermometerSnowflake, 
  ShieldCheck, 
  Search, 
  RefreshCw,
  Navigation,
  Building2,
  Calendar
} from 'lucide-react';

export default function ReceiverDashboard({ setActivePage, onTrackListing }) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [storageFilter, setStorageFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recs, listings] = await Promise.all([
        api.getRecommendations({ include_ineligible: true }),
        api.getListings()
      ]);
      setRecommendations(recs);
      setAllListings(listings);
    } catch (err) {
      console.error('Error fetching receiver data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleClaim = async (listingId) => {
    setActionLoading(true);
    try {
      const updated = await api.acceptListing(listingId);
      setNotification(`Surplus claimed! '${updated.title}' has been moved to Accepted. Transport driver dispatched.`);
      if (onTrackListing) onTrackListing(listingId);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to claim listing');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter recommendations
  const filteredMatches = recommendations.filter(match => {
    const item = match.listing;
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (storageFilter && item.storage_type !== storageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDonor = (item.donor_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDonor) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Receiver Header & Operating Hours Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 bg-[#EDF3EF] text-[#2E86AB] rounded-full">
              Receiver Feed (Step 4)
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-500">{user?.username || user?.org_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14402F] mt-1">
            Nearby Commercial Food Donors
          </h1>
          <p className="text-xs text-gray-500 flex flex-wrap items-center gap-2 pt-0.5">
            <span>Location: <strong>{user?.address}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="font-bold text-[#2E86AB]">
              Receiving Hours Window: {user?.receiving_hours || '08:00 AM - 08:00 PM'}
            </span>
            <span className="text-gray-300">|</span>
            <span>Capacity: {user?.capacity_meals || 300} meals</span>
            <span className="text-gray-300">|</span>
            <span className={user?.has_cold_storage ? 'text-emerald-700 font-bold' : 'text-gray-500'}>
              {user?.has_cold_storage ? '✓ Cold Storage Equipped' : 'Ambient Only'}
            </span>
          </p>
        </div>

        <button
          onClick={() => setActivePage('tracking')}
          className="px-4 py-2.5 rounded-2xl bg-[#F0922B] hover:bg-[#D87D1A] text-white font-bold text-xs shadow-soft transition flex items-center gap-1.5"
        >
          <Navigation className="w-4 h-4" />
          <span>Open Live Tracking Page (Step 5)</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surplus by food name or donor kitchen..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-bold text-gray-700 focus:ring-[#3E8E6A]"
          >
            <option value="">All Categories</option>
            <option value="Cooked Meals">Cooked Meals</option>
            <option value="Bakery & Bread">Bakery & Bread</option>
            <option value="Dairy & Cold">Dairy & Cold</option>
            <option value="Produce & Fresh">Produce & Fresh</option>
          </select>

          <select
            value={storageFilter}
            onChange={(e) => setStorageFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-bold text-gray-700 focus:ring-[#3E8E6A]"
          >
            <option value="">All Storage Modes</option>
            <option value="ambient">Ambient</option>
            <option value="chilled">Chilled (Cold)</option>
            <option value="frozen">Frozen</option>
          </select>

          <button
            onClick={fetchData}
            title="Refresh"
            className="p-2 rounded-xl text-gray-400 hover:text-[#14402F] hover:bg-gray-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Nearby Donors List + Interactive Leaflet Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Nearby Donors Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#14402F]">
              Nearby Surplus Food Donations (Ranked by Proximity & Expiry)
            </h2>
            <span className="text-xs text-gray-500 font-semibold">
              {filteredMatches.length} offers nearby
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400 bg-white rounded-3xl border border-gray-100">
              Locating nearest donor surplus with PostGIS...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 space-y-2">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No surplus donations found nearby</p>
              <p className="text-xs text-gray-400">
                Check back shortly or expand your filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map(match => {
                const item = match.listing;
                const isSelected = selectedListing?.id === item.id;
                const isEligible = match.is_eligible;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListing(item)}
                    className={`rounded-3xl p-6 transition-all duration-200 border cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-[#3E8E6A] shadow-soft-lg'
                        : 'shadow-soft hover:border-[#3E8E6A]/40'
                    } ${
                      !isEligible
                        ? 'bg-gray-50/80 border-gray-200 opacity-75'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#EDF3EF] text-[#3E8E6A] rounded-md">
                            {item.category}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-[#2E86AB] rounded-md capitalize">
                            Storage: {item.storage_type}
                          </span>
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#F0922B] text-white flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {match.match_score}% Match
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-[#14402F] pt-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Donor: <strong className="text-gray-900">{item.donor_name}</strong> • {item.pickup_address}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <span className="text-2xl font-black text-[#14402F]">
                          {item.quantity} <span className="text-xs font-semibold text-gray-500">{item.unit}</span>
                        </span>
                        <CountdownTimer expiryTime={item.expiry_time} compact />
                      </div>
                    </div>

                    {/* Proximity & Feasibility Metric Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-[#EDF3EF]/60 rounded-2xl border border-[#3E8E6A]/20 text-xs mt-3">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Proximity Distance</span>
                        <span className="font-extrabold text-[#14402F]">{match.distance_km} km away</span>
                        <span className="text-[10px] text-gray-500"> (Geofence: {item.pickup_radius_km}km)</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Est. Travel Time</span>
                        <span className="font-extrabold text-[#2E86AB]">{match.estimated_travel_minutes} mins</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Remaining Shelf-Life</span>
                        <span className="font-extrabold text-[#F0922B]">{Math.round(match.remaining_shelf_life_minutes)} mins left</span>
                      </div>
                    </div>

                    {/* Status Stepper */}
                    <div className="pt-2 border-t border-gray-100">
                      <StatusStepper listing={item} />
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Status: <strong className="text-[#14402F]">{item.status}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Claim / Accept */}
                        {item.status === 'Listed' && isEligible && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleClaim(item.id); }}
                            disabled={actionLoading}
                            className="px-5 py-2.5 rounded-xl bg-[#F0922B] hover:bg-[#D87D1A] text-white font-bold text-xs shadow-soft transition flex items-center gap-1.5"
                          >
                            <HeartHandshake className="w-4 h-4" />
                            <span>Claim Surplus Food</span>
                          </button>
                        )}

                        {/* Open Live Tracking Route */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTrackListing) onTrackListing(item.id);
                            setActivePage('tracking');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#EDF3EF] hover:bg-emerald-100 text-[#14402F] text-xs font-bold border border-[#3E8E6A]/20 transition flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#F0922B]" />
                          <span>Track Delivery (Step 5)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Leaflet Map of Nearby Donors */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 space-y-3 sticky top-24">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#14402F]">Nearby Donor Facilities</h3>
                <p className="text-xs text-gray-500">Leaflet Map with Geofenced Donors</p>
              </div>
              <span className="text-xs font-bold text-[#2E86AB] bg-blue-50 px-2.5 py-1 rounded-full">
                Live PostGIS
              </span>
            </div>

            <MapView
              center={[user?.latitude || 17.4385, user?.longitude || 78.4554]}
              zoom={12}
              listings={allListings}
              userLocation={{
                lat: user?.latitude || 17.4385,
                lng: user?.longitude || 78.4554,
                label: user?.org_name || 'Your Food Bank',
                role: 'receiver',
              }}
              selectedListingId={selectedListing?.id}
              className="h-[490px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
