import React, { createContext, useContext, useState, useEffect } from "react";
import { AUTH_API_URL } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("staynest_token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify token and fetch user on load
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("staynest_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${AUTH_API_URL}/me`, {
          headers: {
            "Authorization": `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token is invalid/expired
          logout();
        }
      } catch (err) {
        console.error("Failed to load user with stored token:", err);
        // Do not log out on network error to allow offline use, but set loading false
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      localStorage.setItem("staynest_token", data.token);
      localStorage.setItem("staynest_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      if (!data.token) {
        return {
          ...data,
          pendingVerification: true,
        };
      }

      localStorage.setItem("staynest_token", data.token);
      localStorage.setItem("staynest_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const verifyEmail = async (email, code) => {
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      localStorage.setItem("staynest_token", data.token);
      localStorage.setItem("staynest_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resendCode = async (email) => {
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const adminLogin = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      localStorage.setItem("staynest_token", data.token);
      localStorage.setItem("staynest_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const adminSignup = async (name, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/admin/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create admin account");
      }

      localStorage.setItem("staynest_token", data.token);
      localStorage.setItem("staynest_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("staynest_token");
    localStorage.removeItem("staynest_user");
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        adminLogin,
        adminSignup,
        verifyEmail,
        resendCode,
        logout,
        setError,
      }}
    >
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
