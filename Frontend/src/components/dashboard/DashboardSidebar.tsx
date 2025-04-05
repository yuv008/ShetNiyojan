import React from 'react';
import { Home, BookOpen, Clock, Settings, User, Leaf, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface SidebarItem {
  icon: any;
  path: string;
  position?: "top" | "bottom";
}

const DashboardSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const items: SidebarItem[] = [
    { icon: Home, path: "/dashboard", position: "top" },
    { icon: Leaf, path: "/yield/current", position: "top" },
    { icon: Truck, path: "/supply-chain", position: "top" },
    { icon: BookOpen, path: "/learn", position: "top" },
    { icon: Settings, path: "/dashboard/settings", position: "bottom" },
    { icon: User, path: "/dashboard/profile", position: "bottom" },
  ];

  return (
    <div className="bg-white shadow rounded-lg flex flex-col items-center justify-between py-4 h-full min-h-[calc(100vh-32px)]">
      <div className="flex flex-col items-center space-y-6">
        {items
          .filter(item => item.position === "top")
          .map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-lg transition-colors",
                isActive(item.path)
                  ? "bg-agrigreen text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
      </div>
      <div className="flex flex-col items-center space-y-6">
        {items
          .filter(item => item.position === "bottom")
          .map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-lg transition-colors",
                isActive(item.path)
                  ? "bg-agrigreen text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default DashboardSidebar;
