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
  ChevronRight,
  Info,
  Search,
  Check,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function ReceiverDashboard() {
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
  const [hideIneligible, setHideIneligible] = useState(false);
  const [viewMode, setViewMode] = useState('smart'); // 'smart' or 'all'

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Smart Matching recommendations
      const recs = await api.getRecommendations({ include_ineligible: true });
      setRecommendations(recs);

      // Fetch all listings for standard view
      const listings = await api.getListings();
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
      await api.acceptListing(listingId);
      setNotification('Listing claimed! Food is marked as Accepted. Please dispatch vehicle.');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to claim listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCollected = async (listingId) => {
    setActionLoading(true);
    try {
      await api.markCollected(listingId);
      setNotification('Marked collected! Donor notified to confirm final handover.');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update collection');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter recommendations based on search and filters
  const filteredMatches = recommendations.filter(match => {
    const item = match.listing;
    if (hideIneligible && !match.is_eligible) return false;
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
      {/* Receiver Profile Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 bg-[#EDF3EF] text-[#2E86AB] rounded-full">
              Verified Relief Receiver
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">{user?.org_type || 'Food Bank Hub'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14402F]">
            {user?.org_name || 'City Hope Food Bank'}
          </h1>
          <p className="text-xs text-gray-500 flex flex-wrap items-center gap-2 pt-0.5">
            <span>Location: {user?.address}</span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold text-gray-700">Vehicle Capacity: {user?.capacity_meals || 300} meals</span>
            <span className="text-gray-300">|</span>
            <span className={`font-semibold ${user?.has_cold_storage ? 'text-emerald-700' : 'text-gray-500'}`}>
              Cold Storage: {user?.has_cold_storage ? '✓ Equipped' : '✗ Ambient Only'}
            </span>
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-[#EDF3EF] p-1 rounded-2xl">
          <button
            onClick={() => setViewMode('smart')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'smart'
                ? 'bg-[#14402F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F0922B]" />
            <span>Smart Match Triage</span>
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === 'all'
                ? 'bg-[#14402F] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>All Listings</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Smart Matching Explanation Banner */}
      {viewMode === 'smart' && (
        <div className="bg-[#14402F] text-white p-5 rounded-3xl shadow-soft space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3E8E6A]/30 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#F0922B] text-white flex items-center justify-center font-bold text-xs">
                ⚡
              </span>
              <h3 className="font-extrabold text-sm sm:text-base">
                Smart 4-Stage Matching Pipeline Active
              </h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#9CC5AA] hover:text-white">
              <input
                type="checkbox"
                checked={hideIneligible}
                onChange={(e) => setHideIneligible(e.target.checked)}
                className="w-4 h-4 rounded text-[#3E8E6A] focus:ring-0 cursor-pointer"
              />
              <span>Hide ineligible / out-of-radius listings</span>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[#9CC5AA]">
            <div className="bg-[#0D2B20] p-2.5 rounded-xl border border-[#3E8E6A]/20">
              <span className="font-bold text-white block">1. Geofence Filter</span>
              <span>PostGIS ST_DWithin radius check</span>
            </div>
            <div className="bg-[#0D2B20] p-2.5 rounded-xl border border-[#3E8E6A]/20">
              <span className="font-bold text-white block">2. Travel Feasibility</span>
              <span>Transit time &lt; Remaining shelf life</span>
            </div>
            <div className="bg-[#0D2B20] p-2.5 rounded-xl border border-[#3E8E6A]/20">
              <span className="font-bold text-white block">3. Capacity & Cold Fit</span>
              <span>Vehicle size & refrigeration match</span>
            </div>
            <div className="bg-[#0D2B20] p-2.5 rounded-xl border border-[#3E8E6A]/20">
              <span className="font-bold text-[#F0922B] block">4. Ranked Priority</span>
              <span>Proximity + Urgency + Fit score</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surplus by food name or donor..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:ring-[#3E8E6A]"
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
            className="px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:ring-[#3E8E6A]"
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

      {/* Main Grid: Listings + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Listings cards */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400 bg-white rounded-3xl border border-gray-100">
              Evaluating nearest surplus with PostGIS...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No surplus matching your filters</p>
              <p className="text-xs text-gray-400">
                Try unchecking "Hide ineligible" or clearing filter criteria.
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
                        ? 'bg-gray-100/80 border-gray-200 opacity-70 hover:opacity-100'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    {/* Ineligible Ribbon if rejected */}
                    {!isEligible && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-800 text-xs">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Unfeasible for Auto-Claim:</strong>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-700 mt-0.5">
                            {match.rejection_reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#EDF3EF] text-[#3E8E6A] rounded-md">
                            {item.category}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-[#2E86AB] rounded-md capitalize">
                            Storage: {item.storage_type}
                          </span>
                          {/* Match Score Badge */}
                          <span
                            className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isEligible
                                ? 'bg-[#F0922B] text-white shadow-xs'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {match.match_score}% Match Score
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
                        <span className="text-xl font-black text-[#14402F]">
                          {item.quantity} <span className="text-xs font-semibold text-gray-500">{item.unit}</span>
                        </span>
                        <CountdownTimer expiryTime={item.expiry_time} compact />
                      </div>
                    </div>

                    {/* Distance & Travel Time Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#EDF3EF]/60 rounded-2xl border border-[#3E8E6A]/20 text-xs">
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Distance</span>
                        <span className="font-extrabold text-[#14402F]">{match.distance_km} km</span>
                        <span className="text-[10px] text-gray-500"> (Max: {item.pickup_radius_km}km)</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Est. Travel Time</span>
                        <span className="font-extrabold text-[#2E86AB]">{match.estimated_travel_minutes} mins</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Remaining Shelf-Life</span>
                        <span className="font-extrabold text-[#F0922B]">{Math.round(match.remaining_shelf_life_minutes)} mins</span>
                      </div>
                    </div>

                    {/* Pipeline 4-Stage Breakdown details */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Pipeline Triage Verification:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {match.checks.map((chk, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl text-[11px] flex items-center justify-between border ${
                              chk.passed
                                ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                                : 'bg-red-50/70 border-red-100 text-red-900'
                            }`}
                          >
                            <span className="font-semibold">{chk.name}</span>
                            <span className="text-[10px]">{chk.passed ? '✓ Pass' : '✗ Fail'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Stepper */}
                    <div className="pt-2 border-t border-gray-100">
                      <StatusStepper listing={item} />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
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
                            <span>Claim Surplus (Accept)</span>
                          </button>
                        )}

                        {/* Mark Collected */}
                        {item.status === 'Accepted' && item.claimed_by_id === user?.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMarkCollected(item.id); }}
                            disabled={actionLoading}
                            className="px-5 py-2.5 rounded-xl bg-[#2E86AB] hover:bg-[#256d8a] text-white font-bold text-xs shadow-soft transition flex items-center gap-1.5"
                          >
                            <Truck className="w-4 h-4" />
                            <span>Mark Food Collected</span>
                          </button>
                        )}

                        {item.status === 'Collected' && item.claimed_by_id === user?.id && (
                          <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                            Awaiting Donor Verification Handshake
                          </span>
                        )}

                        {item.status === 'Verified' && (
                          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Confirmed Rescued
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 space-y-3 sticky top-24">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#14402F]">Hyperlocal Spatial Map</h3>
                <p className="text-xs text-gray-500">Your Hub vs Donor Surplus & Geofences</p>
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
                label: user?.org_name,
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
