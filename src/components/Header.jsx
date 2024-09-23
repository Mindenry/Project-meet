import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell,
  User,
  LogOut,
  Calendar,
  XCircle,
  MessageCircle,
  Info,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const Header = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New booking request", read: false },
    { id: 2, message: "Room maintenance scheduled", read: false },
  ]);
  const navigate = useNavigate();

  const userMenuItems = [
    { icon: Calendar, label: "จองห้อง", path: "/dashboard/booking" },
    { icon: XCircle, label: "ยกเลิกการจอง", path: "/dashboard/user-cancel" },
    { icon: MessageCircle, label: "ติดต่อ", path: "/dashboard/contact" },
    { icon: Info, label: "เกี่ยวกับ", path: "/dashboard/about" },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("ออกจากระบบสำเร็จ");
  };

  const handleNotificationClick = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
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
              className="text-gray-600 hover:text-gray-800 flex items-center transition-colors duration-300"
            >
              <item.icon className="w-4 h-4 mr-1" />
              {item.label}
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={handleNotificationClick}
              >
                <span
                  className={
                    notification.read ? "text-gray-500" : "font-semibold"
                  }
                >
                  {notification.message}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-700">{user.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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
