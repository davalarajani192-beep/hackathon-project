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
  Calendar,
  Layers,
  ThermometerSnowflake,
  Flame,
  Check,
  RefreshCw,
  Navigation,
  ArrowRight
} from 'lucide-react';

export default function DonorDashboard({ setActivePage, onTrackListing }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Today's date default
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultTimeStr = new Date(Date.now() + 4 * 3600 * 1000).toTimeString().slice(0, 5);

  // New Listing Form State (explicit date, time, quantity, items)
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cooked Meals',
    quantity: 50,
    unit: 'meals',
    storage_type: 'ambient',
    dietary_info: 'Vegetarian',
    expiry_date: todayStr,
    expiry_time_str: defaultTimeStr,
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

  // Open Food Facts search debounce
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
      // Combine date and time
      const combinedDateTimeStr = `${formData.expiry_date}T${formData.expiry_time_str}:00`;
      const expiry = new Date(combinedDateTimeStr);

      if (expiry.getTime() <= Date.now()) {
        alert('Expiry date and time must be in the future!');
        setActionLoading(false);
        return;
      }

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
      setNotification(`Item "${formData.title}" (${formData.quantity} ${formData.unit}) added to donation list! Nearby receivers have been alerted.`);
      fetchDonorListings();
      // Reset title and notes
      setFormData(prev => ({ ...prev, title: '', notes: '' }));
    } catch (err) {
      alert(err.message || 'Failed to create donation listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCollection = async (listingId) => {
    setActionLoading(true);
    try {
      await api.verifyCollection(listingId);
      setNotification('Handover confirmed! Mutual double-verification complete.');
      fetchDonorListings();
    } catch (err) {
      alert(err.message || 'Failed to verify');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick preset chips
  const quickItems = [
    { title: 'Vegetable Biryani & Mirchi Ka Salan', cat: 'Cooked Meals', qty: 75, unit: 'meals', storage: 'ambient' },
    { title: 'Artisan Wheat Bread & Buns', cat: 'Bakery & Bread', qty: 30, unit: 'kg', storage: 'ambient' },
    { title: 'Fresh Pasteurized Whole Milk', cat: 'Dairy & Cold', qty: 40, unit: 'meals', storage: 'chilled' },
    { title: 'Dal Makhani & Steamed Rice Pots', cat: 'Cooked Meals', qty: 60, unit: 'meals', storage: 'ambient' },
    { title: 'Seasonal Fresh Apples & Oranges', cat: 'Produce & Fresh', qty: 25, unit: 'kg', storage: 'ambient' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Donor Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 bg-[#EDF3EF] text-[#3E8E6A] rounded-full">
              Donor Listing Workspace (Step 2 & 3)
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 font-bold">{user?.username || user?.org_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14402F] mt-1">
            Surplus Food Donation Items
          </h1>
          <p className="text-xs text-gray-500 flex flex-wrap items-center gap-2 pt-0.5">
            <span>Donor Facility: <strong>{user?.org_name}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Gmail: {user?.email}</span>
            <span className="text-gray-300">|</span>
            <span>Phone: {user?.phone || '+91 98450 12345'}</span>
            <span className="text-gray-300">|</span>
            <span className="text-[#3E8E6A] font-bold">
              GPS: {user?.latitude?.toFixed(4)}, {user?.longitude?.toFixed(4)}
            </span>
          </p>
        </div>

        <button
          onClick={() => setActivePage('tracking')}
          className="px-4 py-2.5 rounded-2xl bg-[#F0922B] hover:bg-[#D87D1A] text-white font-bold text-xs shadow-soft transition flex items-center gap-1.5"
        >
          <Navigation className="w-4 h-4" />
          <span>View Live Delivery Tracking</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* FORM: ADD ITEMS TO DONATE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-[#14402F] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#3E8E6A]" /> Enter Items to Donate
            </h2>
            <p className="text-xs text-gray-500">
              Specify the food item name, exact quantity, expiry date & time, and storage mode
            </p>
          </div>
          <span className="text-xs font-bold text-[#F0922B] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Live Expiry Required
          </span>
        </div>

        {/* Quick Click Item Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase text-gray-500">Quick-Select Popular Surplus:</span>
          <div className="flex flex-wrap gap-2">
            {quickItems.map((qi, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  title: qi.title,
                  category: qi.cat,
                  quantity: qi.qty,
                  unit: qi.unit,
                  storage_type: qi.storage
                }))}
                className="px-3 py-1 bg-[#EDF3EF] hover:bg-emerald-100 text-[#14402F] rounded-xl text-xs font-semibold border border-[#3E8E6A]/20 transition"
              >
                + {qi.title} ({qi.qty} {qi.unit})
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-5">
          {/* Item Name & Open Food Facts Search */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              1. What Item Do You Have to Donate?
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
                placeholder="e.g. Fresh Mixed Vegetable Biryani, Cooked Rice & Curry, Loaves of Bread..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              />
              {searchingFood && (
                <span className="absolute right-3 top-3 text-xs text-gray-400">Searching...</span>
              )}
            </div>

            {/* Suggestions */}
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

          {/* Quantity, Unit & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                2. Quantity of Item
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(p => ({ ...p, quantity: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Quantity Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(p => ({ ...p, unit: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:ring-[#3E8E6A]"
              >
                <option value="meals">meals (servings)</option>
                <option value="kg">kg (weight)</option>
                <option value="boxes">boxes / trays</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Food Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:ring-[#3E8E6A]"
              >
                <option value="Cooked Meals">Cooked Meals & Buffets</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Dairy & Cold">Dairy & Cold</option>
                <option value="Produce & Fresh">Produce & Fresh Fruits</option>
                <option value="Canned/Dry Goods">Canned / Dry Packaged</option>
              </select>
            </div>
          </div>

          {/* Expiry Date, Expiry Time & Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#EDF3EF]/60 rounded-2xl border border-[#3E8E6A]/20">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14402F] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#F0922B]" /> 3. Expiry Date
              </label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData(p => ({ ...p, expiry_date: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white focus:ring-[#3E8E6A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14402F] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F0922B]" /> 4. Expiry Time
              </label>
              <input
                type="time"
                required
                value={formData.expiry_time_str}
                onChange={(e) => setFormData(p => ({ ...p, expiry_time_str: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white focus:ring-[#3E8E6A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#14402F] mb-1">
                Storage Type
              </label>
              <select
                value={formData.storage_type}
                onChange={(e) => setFormData(p => ({ ...p, storage_type: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white focus:ring-[#3E8E6A]"
              >
                <option value="ambient">Ambient (Room Temp)</option>
                <option value="chilled">Chilled (Refrigerated 4°C)</option>
                <option value="frozen">Frozen (-18°C)</option>
              </select>
            </div>
          </div>

          {/* Pickup Radius Geofence Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Donor Pickup Radius Geofence (Receivers within this circle can collect)
              </label>
              <span className="text-xs font-black text-[#3E8E6A]">
                {formData.pickup_radius_km} km radius
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

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-8 py-3 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-sm shadow-soft transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLoading ? 'Publishing...' : 'Add Item to Donation List'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* DONATION LIST TABLE & CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div>
            <h2 className="text-xl font-black text-[#14402F]">
              Your Active Surplus Donation List
            </h2>
            <p className="text-xs text-gray-500">
              Surplus offered by {user?.org_name}. Monitored with live expiry countdowns.
            </p>
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
          <div className="p-10 text-center text-sm text-gray-400 bg-white rounded-3xl border border-gray-100">
            Loading donation items...
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 space-y-2">
            <Utensils className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-600">No surplus items listed yet</p>
            <p className="text-xs text-gray-400">
              Use the form above to add surplus items with their expiry date and time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings.map(item => (
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
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-[#2E86AB] rounded-md capitalize">
                        {item.storage_type} storage
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-[#F0922B]/10 text-[#F0922B] rounded-full">
                        Status: {item.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#14402F] pt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Pickup Address: {item.pickup_address} • Radius: {item.pickup_radius_km} km
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <span className="text-2xl font-black text-[#14402F]">
                      {item.quantity} <span className="text-xs font-semibold text-gray-500">{item.unit}</span>
                    </span>
                    <CountdownTimer expiryTime={item.expiry_time} compact />
                  </div>
                </div>

                {/* Expiry Timestamp Details */}
                <div className="p-3 bg-[#EDF3EF]/60 rounded-xl border border-[#3E8E6A]/20 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-[#F0922B]" />
                    <span>Expiry Deadline: <strong>{new Date(item.expiry_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(item.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>

                  {item.claimed_by_name ? (
                    <div className="flex items-center gap-2 text-[#2E86AB] font-bold">
                      <Truck className="w-4 h-4" />
                      <span>Claimed by: {item.claimed_by_name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Unclaimed (Broadcast active in {item.pickup_radius_km}km)</span>
                  )}
                </div>

                {/* Workflow Stepper */}
                <StatusStepper listing={item} />

                {/* Handover & Live Tracking actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Listed at: {new Date(item.listed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Live Tracking */}
                    <button
                      onClick={() => {
                        if (onTrackListing) onTrackListing(item.id);
                        setActivePage('tracking');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#EDF3EF] hover:bg-emerald-100 text-[#14402F] text-xs font-bold border border-[#3E8E6A]/20 transition flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#F0922B]" />
                      <span>Open Live Tracking Route</span>
                    </button>

                    {/* Donor Verification Handshake */}
                    {item.status === 'Collected' && (
                      <button
                        onClick={() => handleVerifyCollection(item.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white text-xs font-bold shadow-soft transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm Handover Verified</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
