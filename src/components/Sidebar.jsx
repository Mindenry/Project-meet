import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  DoorOpen,
  Key,
  Ban,
  XCircle,
  BarChart2,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { toast } from "sonner";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { name: "home", icon: Home, label: "หน้าหลัก", path: "/dashboard" },
    {
      name: "members",
      icon: Users,
      label: "สมาชิก",
      path: "/dashboard/members",
      adminOnly: true,
    },
    {
      name: "rooms",
      icon: DoorOpen,
      label: "ห้องประชุม",
      path: "/dashboard/rooms",
      adminOnly: true,
    },
    {
      name: "access",
      icon: Key,
      label: "การเข้าถึง",
      path: "/dashboard/access",
      adminOnly: true,
    },
    {
      name: "blacklist",
      icon: Ban,
      label: "บัญชีดำ",
      path: "/dashboard/blacklist",
      adminOnly: true,
    },
    {
      name: "cancel",
      icon: XCircle,
      label: "ยกเลิก",
      path: "/dashboard/cancel",
      adminOnly: true,
    },
    {
      name: "report",
      icon: BarChart2,
      label: "รายงาน",
      path: "/dashboard/report",
      adminOnly: true,
    },
    {
      name: "permissions",
      icon: Lock,
      label: "สิทธิ์การใช้งาน",
      path: "/dashboard/permissions",
      adminOnly: true,
    },
  ];

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 },
  };

  const logoVariants = {
    expanded: { opacity: 1, scale: 1 },
    collapsed: { opacity: 0, scale: 0.5 },
  };

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  const handleItemClick = (item) => {
    if (item.adminOnly && user.role !== "admin") {
      toast.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้", { duration: 3000 });
    } else {
      navigate(item.path);
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        className="bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 text-white shadow-2xl h-screen transition-all duration-300 ease-in-out overflow-hidden relative rounded-r-3xl"
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
      >
        <div className="flex justify-between items-center p-4 border-b border-white border-opacity-20">
          <motion.div
            variants={logoVariants}
            initial="collapsed"
            animate={isCollapsed ? "collapsed" : "expanded"}
            transition={{ duration: 0.3 }}
            className="flex items-center"
          >
            <img
              src="/images/logomut.png"
              alt="MUT Reserve Logo"
              className="h-8 w-auto"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-300"
          >
            {isCollapsed ? (
              <ChevronRight size={24} />
            ) : (
              <ChevronLeft size={24} />
            )}
          </motion.button>
        </div>
        <nav className="mt-8 px-2">
          <AnimatePresence>
            {menuItems.map((item) => (
              <motion.div
                key={item.name}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={itemVariants}
                transition={{ duration: 0.3 }}
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleItemClick(item)}
                      className={`flex items-center py-3 px-4 rounded-lg mb-2 ${
                        location.pathname === item.path
                          ? "bg-white bg-opacity-20 shadow-lg"
                          : "hover:bg-white hover:bg-opacity-10"
                      } transition-all duration-300 group relative overflow-hidden ${
                        item.adminOnly && user.role !== "admin"
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 ${
                          isCollapsed ? "mx-auto" : "mr-3"
                        } transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                      />
                      {!isCollapsed && (
                        <span className="font-medium truncate">
                          {item.label}
                        </span>
                      )}
                      {location.pathname === item.path && (
                        <motion.div
                          className="absolute left-0 w-1 h-8 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500 rounded-r-full"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        initial={false}
                        animate={
                          hoveredItem === item.name
                            ? { opacity: 0.1 }
                            : { opacity: 0 }
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" sideOffset={10}>
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
      </motion.div>
    </TooltipProvider>
  );
};

export default Sidebar;
