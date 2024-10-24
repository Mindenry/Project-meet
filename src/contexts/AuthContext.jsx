import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      const storedAuth =
        localStorage.getItem("isAuthenticated") ||
        sessionStorage.getItem("isAuthenticated");

      if (storedUser && storedAuth === "true") {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("isAuthenticated");
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (userData, rememberMe = false) => {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(userData));
      storage.setItem("isAuthenticated", "true");
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(`ยินดีต้อนรับ ${userData.firstName} ${userData.lastName}`, {
        duration: 2000, // แจ้งเตือนหายหลัง 2 วินาที
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", {
        duration: 2000, // แจ้งเตือนหายหลัง 2 วินาที
      });
      clearAuthData();
    }
  };

  const logout = () => {
    clearAuthData();
    toast.success("ออกจากระบบสำเร็จ", {
      duration: 2000, // แจ้งเตือนหายหลัง 2 วินาที
    });
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        checkAuth,
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
