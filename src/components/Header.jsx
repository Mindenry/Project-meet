import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  Calendar,
  History,
  MessageCircle,
  Info,
  User,
  LogOut,
} from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const userMenuItems = [
    { icon: Calendar, label: "จองห้อง", path: "/dashboard/booking" },
    { icon: History, label: "ประวัติการจอง", path: "/dashboard/user-cancel" },
    { icon: MessageCircle, label: "ติดต่อ", path: "/dashboard/contact" },
    { icon: Info, label: "เกี่ยวกับ", path: "/dashboard/about" },
  ];

  const handleLogout = () => {
    logout();
    // Navigate and show toast as before
  };

  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        ></motion.div>
        <nav className="hidden md:flex items-center space-x-6">
          {userMenuItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`relative text-gray-600 hover:text-gray-800 flex items-center transition-all duration-300 ${
                  location.pathname === item.path ? "text-blue-600" : ""
                }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-2 transition-colors duration-300 ${
                    location.pathname === item.path ? "text-blue-600" : ""
                  }`}
                />
                <span>{item.label}</span>
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                    layoutId="underline"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <motion.div
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <User className="h-5 w-5 text-white" />
                </motion.div>
                <span className="font-medium text-gray-700">
                  {user.username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
