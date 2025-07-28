import Modal from '../components/common/Model';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { login as authServiceLogin, signup as authServiceSignup } from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onClose: () => setModal(prev => ({ ...prev, isOpen: false }))
  });

  const decodeToken = useCallback((jwtToken) => {
    if (!jwtToken) return null;
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64));
      return decodedPayload;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decodedUser = decodeToken(storedToken);
      if (decodedUser && decodedUser.id && decodedUser.role) {
        setToken(storedToken);
        setUser({
          userId: decodedUser.id,
          role: decodedUser.role,
          firstName: decodedUser.firstName || 'User',
          lastName: decodedUser.lastName || '',
        });
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [decodeToken]);

 const login = useCallback(async (credentials) => {
  setLoading(true);
  try {
    const data = await authServiceLogin(credentials.email, credentials.password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({ userId: data.userId, role: data.role, firstName: data.firstName, lastName: data.lastName });
    setModal({
      isOpen: true,
      title: 'Login Successful!',
      message: `Welcome back, ${data.firstName || data.email}!`,
      type: 'success',
      onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
    });
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.details
      ? error.response.data.details.map(err => err.message).join('; ')
      : error.message;
    setModal({
      isOpen: true,
      title: 'Login Failed',
      message: errorMessage || 'Login failed. Please try again.',
      type: 'error',
      onClose: () => setModal(prev => ({ ...prev, isOpen: false })),
    });
    throw error;
  } finally {
    setLoading(false);
  }
}, []);

  const signup = useCallback(async (userData) => {
    setLoading(true);
    try {
      const data = await authServiceSignup(userData.email, userData.password, userData.firstName, userData.lastName, userData.role);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ userId: data.userId, role: data.role, firstName: userData.firstName, lastName: userData.lastName });
      setModal({
        isOpen: true,
        title: "Signup Successful!",
        message: "Your account has been created. Welcome!",
        type: "success",
        onClose: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      return data;
    } catch (error) {
      setModal({
        isOpen: true,
        title: "Signup Failed",
        message: error.message,
        type: "error",
        onClose: () => setModal(prev => ({ ...prev, isOpen: false }))
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setModal({
      isOpen: true,
      title: "Logged Out",
      message: "You have been successfully logged out.",
      type: "info",
      onClose: () => setModal(prev => ({ ...prev, isOpen: false }))
    });
  }, []);

  const contextValue = React.useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    signup,
    logout,
    showModal: setModal 
  }), [token, user, loading, login, signup, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
