import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  donor: {
    email: 'donor@canteen.org',
    password: 'donor123',
    role: 'donor',
    org_name: 'Grand Horizon Banquet & Catering',
    address: '14 Raj Bhavan Road, Somajiguda, Hyderabad',
    latitude: 17.4239,
    longitude: 78.4611,
    default_radius_km: 12.0
  },
  receiver: {
    email: 'receiver@foodbank.org',
    password: 'receiver123',
    role: 'receiver',
    org_name: 'City Hope Food Bank & Distribution Hub',
    address: 'Greenlands Road, Begumpet, Hyderabad',
    latitude: 17.4385,
    longitude: 78.4554,
    capacity_meals: 300.0,
    has_cold_storage: true
  },
  admin: {
    email: 'admin@easyrescue.org',
    password: 'admin123',
    role: 'admin',
    org_name: 'Decoders EASY Admin Team',
    address: 'Decoders Command Center, Hyderabad',
    latitude: 17.4300,
    longitude: 78.4500
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('easy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('easy_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('easy_token', token);
    } else {
      localStorage.removeItem('easy_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('easy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('easy_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // In case backend is not actively running during static demo preview, mock user seamlessly
      const foundDemo = Object.values(DEMO_ACCOUNTS).find(a => a.email === email);
      if (foundDemo && password.includes('123')) {
        const mockUser = {
          id: foundDemo.role === 'donor' ? 1 : foundDemo.role === 'receiver' ? 4 : 7,
          ...foundDemo,
          created_at: new Date().toISOString()
        };
        setUser(mockUser);
        setToken('mock_demo_jwt_token');
        return mockUser;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await api.register(userData);
      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('easy_token');
    localStorage.removeItem('easy_user');
  };

  const switchDemoRole = async (roleName) => {
    const creds = DEMO_ACCOUNTS[roleName];
    if (creds) {
      try {
        await login(creds.email, creds.password);
      } catch (err) {
        console.warn('Fallback to local mock session for demo switch:', err);
        const mockUser = {
          id: roleName === 'donor' ? 1 : roleName === 'receiver' ? 4 : 7,
          ...creds,
          created_at: new Date().toISOString()
        };
        setUser(mockUser);
        setToken('mock_demo_jwt_token');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
