import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, HeartHandshake, ArrowRight, AlertCircle, MapPin, Compass, Clock, Phone, User, Mail } from 'lucide-react';

export default function RegisterPage({ setActivePage }) {
  const { register, loading } = useAuth();
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: 'password123',
    address: 'Banjara Hills, Hyderabad',
    latitude: 17.4150,
    longitude: 78.4400,
    default_radius_km: 10.0,
    // Receiver times
    receiving_hours: '08:00 AM - 08:00 PM',
    capacity_meals: 150.0,
    has_cold_storage: false,
  });
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Auto-detect browser GPS coordinates
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(4)),
          longitude: parseFloat(pos.coords.longitude.toFixed(4)),
        }));
        setGpsLoading(false);
      },
      () => {
        // Fallback to vibrant city center
        setFormData(prev => ({
          ...prev,
          latitude: 17.4320,
          longitude: 78.4520,
        }));
        setGpsLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        role,
        org_name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        default_radius_km: parseFloat(formData.default_radius_km),
        receiving_hours: formData.receiving_hours,
        capacity_meals: parseFloat(formData.capacity_meals),
        has_cold_storage: formData.has_cold_storage,
      };

      const user = await register(payload);
      
      // As requested by user:
      // If he was the donor -> go directly to donor list next page!
      // If he was the receiver -> go directly to receiver nearby donors page!
      if (user.role === 'donor') {
        setActivePage('donor');
      } else {
        setActivePage('receiver');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#F8FAF9]">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-gray-100">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF3EF] text-[#3E8E6A] font-bold text-xs uppercase tracking-wide">
            Last Bite Onboarding
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#14402F]">
            Step 1: Choose Your Role
          </h2>
          <p className="text-xs text-gray-500 italic">"Surplus today. A meal tonight."</p>
        </div>

        {/* Role Selector Tabs: Donor vs Receiver */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#EDF3EF] rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              role === 'donor'
                ? 'bg-[#14402F] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-[#3E8E6A]" />
            <span>I'm a Food Donor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('receiver')}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              role === 'receiver'
                ? 'bg-[#14402F] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-[#F0922B]" />
            <span>I'm a Food Receiver</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                {role === 'donor' ? 'Donor / Restaurant Name' : 'Receiver / Food Bank Name'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={role === 'donor' ? 'e.g. Royal Palace Banquet' : 'e.g. City Hope Food Bank'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={role === 'donor' ? 'e.g. royal_chef' : 'e.g. hope_volunteer'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                />
              </div>
            </div>
          </div>

          {/* Gmail ID & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Gmail / Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98450 12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
                />
              </div>
            </div>
          </div>

          {/* Location in Longitudinal and Latitudinal */}
          <div className="p-4 bg-[#EDF3EF]/70 rounded-2xl border border-[#3E8E6A]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-[#14402F] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#3E8E6A]" /> GPS Coordinates & Location
              </span>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-[#3E8E6A]/30 text-[#3E8E6A] hover:bg-emerald-50 transition"
              >
                {gpsLoading ? 'Detecting...' : '📍 Auto-Detect GPS'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-0.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white font-mono font-bold focus:ring-[#3E8E6A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-0.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white font-mono font-bold focus:ring-[#3E8E6A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-600 mb-0.5">
                Physical Facility Street Address
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address for collection"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:ring-[#3E8E6A]"
              />
            </div>
          </div>

          {/* ROLE SPECIFIC FIELDS */}
          {role === 'donor' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Default Pickup Geofence Radius
                </label>
                <span className="text-xs font-extrabold text-[#3E8E6A]">
                  {formData.default_radius_km} km
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                name="default_radius_km"
                value={formData.default_radius_km}
                onChange={handleChange}
                className="w-full accent-[#3E8E6A] cursor-pointer"
              />
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-blue-50/60 rounded-2xl border border-blue-200/60">
              {/* Receiver Operating Times */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2E86AB] mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> All Times of Receiving (Operating Hours Window)
                </label>
                <select
                  name="receiving_hours"
                  value={formData.receiving_hours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-bold text-gray-700 focus:ring-[#2E86AB]"
                >
                  <option value="08:00 AM - 08:00 PM">Daytime Window: 08:00 AM – 08:00 PM</option>
                  <option value="06:00 AM - 12:00 PM">Morning Shifts: 06:00 AM – 12:00 PM</option>
                  <option value="12:00 PM - 06:00 PM">Afternoon Shifts: 12:00 PM – 06:00 PM</option>
                  <option value="06:00 PM - 11:00 PM">Night Rescue: 06:00 PM – 11:00 PM</option>
                  <option value="24/7 Any Time">24/7 Any Time (Emergency Night Shelter)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-600 mb-0.5">
                    Vehicle Capacity (Meals)
                  </label>
                  <input
                    type="number"
                    name="capacity_meals"
                    min="10"
                    max="3000"
                    value={formData.capacity_meals}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white font-bold focus:ring-[#2E86AB]"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#14402F]">
                    <input
                      type="checkbox"
                      name="has_cold_storage"
                      checked={formData.has_cold_storage}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#2E86AB] rounded focus:ring-[#2E86AB]"
                    />
                    <span>Refrigerated / Cold Storage</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-sm shadow-soft transition flex items-center justify-center gap-2"
          >
            <span>
              {loading ? 'Creating Profile...' : role === 'donor' ? 'Continue to Donor Surplus List ➔' : 'Continue to Nearby Donors Feed ➔'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <button
            onClick={() => setActivePage('login')}
            className="font-bold text-[#14402F] hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
