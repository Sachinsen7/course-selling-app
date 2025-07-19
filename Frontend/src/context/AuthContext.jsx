import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { login as authServiceLogin, signup as authServiceSignup } from '../services/auth'; 
import { useToast } from '../components/notifications/toasts'; 

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

  const { toast } = useToast();

 
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
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${data.firstName || data.email}!`,
        variant: "success",
      });
      return data; 
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "error",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Signup function for the context
  const signup = useCallback(async (userData) => {
    setLoading(true);
    try {
     
      const data = await authServiceSignup(userData.email, userData.password, userData.firstName, userData.lastName, userData.role);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser({ userId: data.userId, role: data.role, firstName: userData.firstName, lastName: userData.lastName });
      toast({
        title: "Signup Successful!",
        description: "Your account has been created. Welcome!",
        variant: "success",
      });
      return data;
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "error",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  }, [toast]);

 
  const contextValue = React.useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    signup,
    logout,
  }), [token, user, loading, login, signup, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
