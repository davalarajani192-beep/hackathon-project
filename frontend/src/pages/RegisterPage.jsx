import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Utensils, HeartHandshake, Shield, ArrowRight, AlertCircle, Building2, MapPin } from 'lucide-react';

export default function RegisterPage({ setActivePage }) {
  const { register, loading } = useAuth();
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    org_name: '',
    org_type: 'Canteen',
    phone: '',
    address: 'Banjara Hills, Hyderabad',
    latitude: 17.4150,
    longitude: 78.4400,
    default_radius_km: 10.0,
    capacity_meals: 150.0,
    has_cold_storage: false,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        role,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        default_radius_km: parseFloat(formData.default_radius_km),
        capacity_meals: parseFloat(formData.capacity_meals),
      };
      const user = await register(payload);
      if (user.role === 'donor') setActivePage('donor');
      else setActivePage('receiver');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAF9]">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-gray-100">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-[#14402F]">Join EASY Food Rescue</h2>
          <p className="text-xs text-gray-500 italic">"Surplus today. A meal tonight."</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#EDF3EF] rounded-2xl">
          <button
            type="button"
            onClick={() => { setRole('donor'); setFormData(p => ({ ...p, org_type: 'Canteen' })); }}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              role === 'donor'
                ? 'bg-[#14402F] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-4 h-4 text-[#3E8E6A]" />
            <span>Commercial Donor</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole('receiver'); setFormData(p => ({ ...p, org_type: 'Food Bank' })); }}
            className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              role === 'receiver'
                ? 'bg-[#14402F] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-[#F0922B]" />
            <span>Community Receiver</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                name="org_name"
                required
                value={formData.org_name}
                onChange={handleChange}
                placeholder={role === 'donor' ? 'e.g. Royal Palace Banquet' : 'e.g. Hope Food Bank'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Organization Type
              </label>
              <select
                name="org_type"
                value={formData.org_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              >
                {role === 'donor' ? (
                  <>
                    <option value="Canteen">Canteen / Cafeteria</option>
                    <option value="Banquet Hall">Banquet Hall</option>
                    <option value="Grocer">Grocer / Supermarket</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Bakery">Bakery</option>
                  </>
                ) : (
                  <>
                    <option value="Food Bank">Food Bank</option>
                    <option value="Community Kitchen">Community Kitchen</option>
                    <option value="Shelter">Night Shelter</option>
                    <option value="NGO">Relief NGO</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@org.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Facility Address
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Full physical street address"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3E8E6A]"
            />
          </div>

          {/* Role specific fields */}
          {role === 'donor' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Default Pickup Radius Geofence
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
              <p className="text-[11px] text-gray-500 mt-1">
                Receivers outside this radius cannot claim without special approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#EDF3EF]/60 rounded-xl border border-[#3E8E6A]/20">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Distribution Capacity (Meals)
                </label>
                <input
                  type="number"
                  name="capacity_meals"
                  min="10"
                  max="2000"
                  value={formData.capacity_meals}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-[#3E8E6A]"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#14402F]">
                  <input
                    type="checkbox"
                    name="has_cold_storage"
                    checked={formData.has_cold_storage}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#3E8E6A] rounded focus:ring-[#3E8E6A]"
                  />
                  <span>Refrigerated / Cold Storage Equipped</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#3E8E6A] hover:bg-[#347859] text-white font-bold text-sm shadow-soft transition flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Profile...' : `Register as ${role === 'donor' ? 'Donor' : 'Receiver'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <button
            onClick={() => setActivePage('login')}
            className="font-bold text-[#14402F] hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
