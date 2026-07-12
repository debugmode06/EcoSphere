import { createContext, useContext, useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ecosphere_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ecosphere_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const { token: newToken, employee } = res.data;
    localStorage.setItem('ecosphere_token', newToken);
    localStorage.setItem('ecosphere_user', JSON.stringify(employee));
    setToken(newToken);
    setUser(employee);
    return employee;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecosphere_token');
    localStorage.removeItem('ecosphere_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token;
  const decoded = token ? decodeToken(token) : null;
  const role = user?.role || decoded?.role;

  return (
    <AuthContext.Provider value={{ token, user, setUser, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
