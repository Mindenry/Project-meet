import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  LogOut,
  Calendar,
  XCircle,
  MessageCircle,
  Info,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems = [
    { icon: Calendar, label: "จองห้อง", path: "/dashboard/booking" },
    { icon: XCircle, label: "ประวัติการจอง", path: "/dashboard/user-cancel" },
    { icon: MessageCircle, label: "ติดต่อ", path: "/dashboard/contact" },
    { icon: Info, label: "เกี่ยวกับ", path: "/dashboard/about" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("ออกจากระบบสำเร็จ");
  };

  return (
    <header className="bg-white shadow-lg py-4 px-6 flex justify-between items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center"
      ></motion.div>
      <nav className="hidden md:flex items-center space-x-4">
        {userMenuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className={`text-gray-600 hover:text-blue-600 flex items-center transition-all duration-300 px-3 py-2 rounded-md ${
                location.pathname === item.path
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-2 transition-transform duration-300 ${
                  location.pathname === item.path ? "scale-110" : ""
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-gray-100 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300">
                {user.username}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 transition-colors duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>ออกจากระบบ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
