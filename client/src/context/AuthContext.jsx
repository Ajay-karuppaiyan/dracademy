import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data.requiresTwoFactor) {
        return { success: true, requiresTwoFactor: true, userId: data._id };
      }
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("id", data._id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Network error",
        action: error.response?.data?.action
      };
    }
  };

  const googleLogin = async (token) => {
    try {
      const { data } = await api.post("/auth/google", { token });

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("id", data._id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Google auth error",
        action: error.response?.data?.action,
        googleData: error.response?.data?.googleData,
      };
    }
  };

  const verifyTwoFactor = async (userId, token) => {
    try {
      const { data } = await api.post("/auth/2fa/validate", { userId, token });

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Network error",
      };
    }
  };

  const sendOtp = async (email) => {
    try {
      const { data } = await api.post("/auth/send-otp", { email });
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send OTP",
      };
    }
  };

  const register = async (name, email, mobile, password, role = "student", otp, googleId) => {
    try {
      const payload = {
        name,
        email,
        mobile,
        password,
        role,
      };

      if (otp) payload.otp = otp;
      if (googleId) payload.googleId = googleId;

      const { data } = await api.post("/auth/register", payload);

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Network error",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    setUser,
    login,
    googleLogin,
    logout,
    register,
    sendOtp,
    verifyTwoFactor,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
