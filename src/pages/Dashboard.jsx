import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import HomeSection from "../components/sections/HomeSection";
import MembersSection from "../components/sections/MembersSection";
import RoomsSection from "../components/sections/RoomsSection";
import AccessSection from "../components/sections/AccessSection";
import BlacklistSection from "../components/sections/BlacklistSection";
import CancelSection from "../components/sections/CancelSection";
import ReportSection from "../components/sections/ReportSection";
import PermissionsSection from "../components/sections/PermissionsSection";
import AboutSection from "../components/sections/AboutSection";
import BookingSection from "../components/sections/BookingSection";
import ContactSection from "../components/sections/ContactSection";
import UserCancelSection from "../components/sections/UserCancelSection";

const Dashboard = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <Routes>
            <Route path="/" element={<HomeSection />} />
            {user.role === "admin" && (
              <>
                <Route path="/members" element={<MembersSection />} />
                <Route path="/rooms" element={<RoomsSection />} />
                <Route path="/access" element={<AccessSection />} />
                <Route path="/blacklist" element={<BlacklistSection />} />
                <Route path="/cancel" element={<CancelSection />} />
                <Route path="/report" element={<ReportSection />} />
                <Route path="/permissions" element={<PermissionsSection />} />
              </>
            )}
            <Route path="/booking" element={<BookingSection />} />
            <Route path="/user-cancel" element={<UserCancelSection />} />
            <Route path="/about" element={<AboutSection />} />
            <Route path="/contact" element={<ContactSection />} />
            <Route path="*" element={<AccessDenied />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AccessDenied = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  </div>
);

export default Dashboard;
