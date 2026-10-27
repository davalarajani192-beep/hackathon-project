import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import StatusStepper from '../components/StatusStepper';
import MapView from '../components/MapView';
import { 
  Plus, 
  Utensils, 
  CheckCircle, 
  ShieldCheck, 
  Clock, 
  Search, 
  Sparkles, 
  AlertCircle,
  Truck,
  Layers,
  ThermometerSnowflake,
  Flame,
  Check,
  RefreshCw
} from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'Listed', 'Accepted', 'Collected', 'Verified'
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // New Listing Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cooked Meals',
    quantity: 60,
    unit: 'meals',
    storage_type: 'ambient',
    dietary_info: 'Vegetarian',
    expiryHoursAhead: 3,
    pickup_address: user?.address || '14 Raj Bhavan Road, Somajiguda, Hyderabad',
    latitude: user?.latitude || 17.4239,
    longitude: user?.longitude || 78.4611,
    pickup_radius_km: user?.default_radius_km || 10.0,
    notes: '',
  });

  // Open Food Facts search
  const [foodQuery, setFoodQuery] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState([]);
  const [searchingFood, setSearchingFood] = useState(false);

  const fetchDonorListings = async () => {
    try {
      setLoading(true);
      const data = await api.getListings({ donor_id: user?.id });
      setListings(data);
    } catch (err) {
      console.error('Error fetching donor listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorListings();
  }, [user]);

  // Handle Open Food Facts suggestion search
  useEffect(() => {
    if (!foodQuery || foodQuery.length < 2) {
      setFoodSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingFood(true);
      try {
        const results = await api.searchFoodFacts(foodQuery);
        setFoodSuggestions(results);
      } catch (e) {
        console.warn('Food search err:', e);
      } finally {
        setSearchingFood(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [foodQuery]);

  const selectSuggestion = (item) => {
    setFormData((prev) => ({
      ...prev,
      title: item.name,
      category: item.category || prev.category,
      storage_type: item.storage_type || prev.storage_type,
      dietary_info: item.dietary || prev.dietary_info,
    }));
    setFoodQuery('');
    setFoodSuggestions([]);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const expiry = new Date(Date.now() + formData.expiryHoursAhead * 60 * 60 * 1000);
      const payload = {
        title: formData.title,
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        storage_type: formData.storage_type,
        dietary_info: formData.dietary_info,
        expiry_time: expiry.toISOString(),
        pickup_address: formData.pickup_address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        pickup_radius_km: parseFloat(formData.pickup_radius_km),
        notes: formData.notes,
      };

      await api.createListing(payload);
      setShowCreateModal(false);
      setNotification('Surplus listing created successfully! Geofence alert active.');
      fetchDonorListings();
      // Reset form
      setFormData(prev => ({ ...prev, title: '', notes: '' }));
    } catch (err) {
      alert(err.message || 'Failed to create listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCollection = async (listingId) => {
    setActionLoading(true);
    try {
      await api.verifyCollection(listingId);
      setNotification('Handover confirmed! Double-verification complete.');
      fetchDonorListings();
    } catch (err) {
      alert(err.message || 'Failed to verify');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculation
  const totalListedMeals = listings.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCollectedMeals = listings
    .filter(l => ['Collected', 'Verified'].includes(l.status))
    .reduce((acc, curr) => acc + curr.quantity, 0);
  const totalVerifiedMeals = listings
    .filter(l => l.status === 'Verified')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const filteredListings = listings.filter(item => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Org Profile info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 bg-[#EDF3EF] text-[#3E8E6A] rounded-full">
              Commercial Donor Workspace
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-medium">{user?.org_type}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14402F]">
            {user?.org_name || 'Commercial Kitchen Hub'}
          </h1>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span>Facility Address: {user?.address}</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#3E8E6A] font-bold">Pickup Radius: {user?.default_radius_km || 10} km</span>
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-sm shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Post Surplus Food</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-emerald-600 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#EDF3EF] p-6 rounded-3xl border border-[#3E8E6A]/20 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Listed Meals (Offered)
            </span>
            <div className="w-9 h-9 rounded-xl bg-white text-[#14402F] flex items-center justify-center shadow-xs">
              <Utensils className="w-4 h-4 text-[#3E8E6A]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#14402F] mt-3">
            {totalListedMeals.toLocaleString()} <span className="text-sm font-semibold text-gray-600">meals</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Total surplus offered on EASY</p>
        </div>

        <div className="bg-[#EDF3EF] p-6 rounded-3xl border border-[#3E8E6A]/20 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Collected Meals (Accepted)
            </span>
            <div className="w-9 h-9 rounded-xl bg-white text-[#2E86AB] flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#2E86AB] mt-3">
            {totalCollectedMeals.toLocaleString()} <span className="text-sm font-semibold text-gray-600">meals</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Picked up by local food banks</p>
        </div>

        <div className="bg-[#EDF3EF] p-6 rounded-3xl border border-[#3E8E6A]/20 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Verified Meals (Confirmed)
            </span>
            <div className="w-9 h-9 rounded-xl bg-white text-[#3E8E6A] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#3E8E6A] mt-3">
            {totalVerifiedMeals.toLocaleString()} <span className="text-sm font-semibold text-gray-600">meals</span>
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Double-handshake confirmed & verified</p>
        </div>
      </div>

      {/* Main Grid: Listings & Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Listings list */}
        <div className="lg:col-span-7 space-y-5">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All Listings' },
                { id: 'Listed', label: 'Active (Listed)' },
                { id: 'Accepted', label: 'Accepted' },
                { id: 'Collected', label: 'Collected (Needs Verify)' },
                { id: 'Verified', label: 'Verified' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-[#14402F] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchDonorListings}
              title="Refresh"
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#14402F] hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-400 bg-white rounded-3xl border border-gray-100">
              Loading surplus listings...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 space-y-3">
              <Utensils className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No surplus listings found</p>
              <p className="text-xs text-gray-400">
                Post surplus food using the button above to broadcast it within your pickup radius.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 hover:border-[#3E8E6A]/30 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#EDF3EF] text-[#3E8E6A] rounded-md">
                          {item.category}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-[#2E86AB] rounded-md">
                          Storage: {item.storage_type}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
                          {item.dietary_info}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-[#14402F] pt-1">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.pickup_address}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <span className="text-xl font-black text-[#14402F]">
                        {item.quantity} <span className="text-xs font-semibold text-gray-500">{item.unit}</span>
                      </span>
                      <CountdownTimer expiryTime={item.expiry_time} compact />
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Stepper Workflow */}
                  <div className="pt-2 border-t border-gray-100">
                    <StatusStepper listing={item} />
                  </div>

                  {/* Claimed by Info */}
                  {item.claimed_by_name && (
                    <div className="p-3 bg-[#EDF3EF]/60 rounded-xl border border-[#3E8E6A]/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-gray-500">Receiver Claim: </span>
                        <strong className="text-[#14402F]">{item.claimed_by_name}</strong>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white text-[11px] font-bold text-[#2E86AB] border border-gray-200">
                        Dispatched
                      </span>
                    </div>
                  )}

                  {/* Donor Action: Confirm Handover Verification */}
                  {item.status === 'Collected' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <p className="text-xs font-bold text-[#14402F]">
                          Receiver marked food as collected
                        </p>
                        <p className="text-[11px] text-gray-600">
                          Confirm that food was successfully transferred to complete double-verification.
                        </p>
                      </div>
                      <button
                        onClick={() => handleVerifyCollection(item.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-xs shadow-soft transition flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm Handover</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Geofence Map */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#14402F]">Pickup Radius & Geofence</h3>
                <p className="text-xs text-gray-500">Surplus is broadcast within this radius circle</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EDF3EF] text-[#3E8E6A] font-extrabold text-xs">
                {user?.default_radius_km || 10} km Radius
              </span>
            </div>

            <MapView
              center={[user?.latitude || 17.4239, user?.longitude || 78.4611]}
              zoom={12}
              listings={listings}
              activeCircle={{
                lat: user?.latitude || 17.4239,
                lng: user?.longitude || 78.4611,
                radiusKm: user?.default_radius_km || 10,
                label: user?.org_name,
              }}
              userLocation={{
                lat: user?.latitude || 17.4239,
                lng: user?.longitude || 78.4611,
                label: user?.org_name,
                role: 'donor',
              }}
              className="h-[480px]"
            />
          </div>
        </div>
      </div>

      {/* CREATE LISTING MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold uppercase text-[#3E8E6A]">Instant Surplus Broadcast</span>
                <h2 className="text-xl font-black text-[#14402F]">Post Food Surplus</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Open Food Facts Search / Auto-complete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Food Item / Surplus Title
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.title || foodQuery}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, title: e.target.value }));
                      setFoodQuery(e.target.value);
                    }}
                    placeholder="e.g. Fresh Paneer Pulao & Dal Makhani (or search taxonomy)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                  />
                  {searchingFood && (
                    <span className="absolute right-3 top-3 text-xs text-gray-400">Searching...</span>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {foodSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-100">
                    <div className="px-3 py-1.5 bg-[#EDF3EF] text-[10px] font-bold text-[#3E8E6A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#F0922B]" /> Open Food Facts & Culinary Presets:
                    </div>
                    {foodSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectSuggestion(item)}
                        className="p-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <span className="font-semibold text-gray-800">{item.name}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {item.category} • {item.storage_type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category & Storage Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Food Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                  >
                    <option value="Cooked Meals">Cooked Meals & Buffets</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                    <option value="Dairy & Cold">Dairy & Cold</option>
                    <option value="Produce & Fresh">Produce & Fresh Fruits</option>
                    <option value="Canned/Dry Goods">Canned / Dry Packaged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Storage Requirement
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['ambient', 'chilled', 'frozen'].map(st => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setFormData(p => ({ ...p, storage_type: st }))}
                        className={`py-2 px-1 text-xs font-bold rounded-xl capitalize transition ${
                          formData.storage_type === st
                            ? 'bg-[#14402F] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity, Unit & Dietary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                  >
                    <option value="meals">meals (servings)</option>
                    <option value="kg">kg (weight)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Dietary Classification
                  </label>
                  <select
                    value={formData.dietary_info}
                    onChange={(e) => setFormData(p => ({ ...p, dietary_info: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Halal">Halal</option>
                  </select>
                </div>
              </div>

              {/* Expiry Window */}
              <div className="p-4 bg-[#EDF3EF]/60 rounded-2xl border border-[#3E8E6A]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Remaining Shelf-Life Countdown
                  </label>
                  <span className="text-xs font-extrabold text-[#F0922B]">
                    Expiring in {formData.expiryHoursAhead} hours
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="0.5"
                  value={formData.expiryHoursAhead}
                  onChange={(e) => setFormData(p => ({ ...p, expiryHoursAhead: parseFloat(e.target.value) }))}
                  className="w-full accent-[#F0922B] cursor-pointer"
                />
                <p className="text-[11px] text-gray-500">
                  Unclaimed items will automatically expire once this countdown reaches zero.
                </p>
              </div>

              {/* Pickup Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Pickup Radius Geofence (km)
                  </label>
                  <span className="text-xs font-extrabold text-[#3E8E6A]">
                    {formData.pickup_radius_km} km
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={formData.pickup_radius_km}
                  onChange={(e) => setFormData(p => ({ ...p, pickup_radius_km: parseFloat(e.target.value) }))}
                  className="w-full accent-[#3E8E6A] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Pickup Instructions / Handling Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g. Stored in hot trays, please bring insulated catering bags."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white text-xs font-bold shadow-soft transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{actionLoading ? 'Publishing...' : 'Publish Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
