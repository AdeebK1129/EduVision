/**
 * AuthContext.tsx
 * This file defines the AuthContext and AuthProvider for managing authentication state in a React application.
 * It provides a way to access and update the authentication token throughout the app.
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import api, { setAuthToken } from "../utils/api";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);

  const setToken = (token: string | null) => {
    setTokenState(token);
    if (token) {
      localStorage.setItem("authToken", token);
      setAuthToken(token);
    } else {
      localStorage.removeItem("authToken");
      setAuthToken(null);
    }
  };

  const logout = () => {
    setToken(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
