// API client with token handling and automatic resilient fallback

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('easy_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid email or password');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Listings
  async getListings(params = {}) {
    const url = new URL(`${API_BASE}/api/listings`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch listings');
    return res.json();
  },

  async createListing(listingData) {
    const res = await fetch(`${API_BASE}/api/listings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Creation failed' }));
      throw new Error(err.detail || 'Failed to create listing');
    }
    return res.json();
  },

  async acceptListing(listingId) {
    const res = await fetch(`${API_BASE}/api/listings/${listingId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Claim failed' }));
      throw new Error(err.detail || 'Failed to claim listing');
    }
    return res.json();
  },

  async markCollected(listingId) {
    const res = await fetch(`${API_BASE}/api/listings/${listingId}/collect`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Collection update failed' }));
      throw new Error(err.detail || 'Failed to mark collected');
    }
    return res.json();
  },

  async verifyCollection(listingId) {
    const res = await fetch(`${API_BASE}/api/listings/${listingId}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed' }));
      throw new Error(err.detail || 'Failed to verify collection');
    }
    return res.json();
  },

  // Smart Matching
  async getRecommendations(params = {}) {
    const url = new URL(`${API_BASE}/api/matching/recommendations`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  // Admin & Metrics
  async getMetrics() {
    const res = await fetch(`${API_BASE}/api/admin/metrics`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  },

  async getAuditLogs(params = {}) {
    const url = new URL(`${API_BASE}/api/admin/audit-logs`);
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.append(k, v);
    });
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Open Food Facts
  async searchFoodFacts(query) {
    if (!query) return [];
    const res = await fetch(`${API_BASE}/api/food-facts/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  },
};
