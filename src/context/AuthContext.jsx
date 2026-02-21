import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token ရှိရင် user data ပြန်ယူတဲ့ logic ဒီမှာထည့်နိုင်ပါတယ်
      const savedUser = JSON.parse(localStorage.getItem('user'));
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // OTP တောင်းဆိုခြင်း
  const requestOTP = async (phone) => {
    try {
      const res = await axios.post('/api/auth/request-otp', { phone });
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  // OTP စစ်ဆေးခြင်း
  const verifyOTP = async (phone, code) => {
    try {
      const res = await axios.post('/api/auth/verify-otp', { phone, code });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, requestOTP, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};