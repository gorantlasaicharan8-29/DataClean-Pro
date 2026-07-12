import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('dc_token');
    const storedUser = localStorage.getItem('dc_user');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('dc_token');
        localStorage.removeItem('dc_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response;

      const resolvedUser = userData || {
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email,
        role: 'Analyst',
        avatar: null,
      };

      localStorage.setItem('dc_token', token);
      localStorage.setItem('dc_user', JSON.stringify(resolvedUser));

      setToken(token);
      setUser(resolvedUser);
      setIsAuthenticated(true);
      setLoading(false);

      return { success: true };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.detail || error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dc_token');
    localStorage.removeItem('dc_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
