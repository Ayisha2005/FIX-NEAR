import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('homeserve_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('homeserve_token') || null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          localStorage.setItem('homeserve_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error("Auth verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('homeserve_token', newToken);
    localStorage.setItem('homeserve_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('homeserve_token', newToken);
    localStorage.setItem('homeserve_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('homeserve_token');
    localStorage.removeItem('homeserve_user');
    setToken(null);
    setUser(null);
  };

  const updateUserState = (newUserData, newToken) => {
    if (newToken) {
      localStorage.setItem('homeserve_token', newToken);
      setToken(newToken);
    }
    const merged = { ...user, ...newUserData };
    setUser(merged);
    localStorage.setItem('homeserve_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
