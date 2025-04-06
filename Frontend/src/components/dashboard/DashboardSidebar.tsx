import React from 'react';
import { Home, BookOpen, Clock, Settings, User, Leaf, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface SidebarItem {
  icon: any;
  path: string;
  position?: "top" | "bottom";
  label?: string;
}

interface DashboardSidebarProps {
  isMobile?: boolean;
}

const DashboardSidebar = ({ isMobile = false }: DashboardSidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const items: SidebarItem[] = [
    { icon: Home, path: "/dashboard", position: "top", label: "Home" },
    { icon: Truck, path: "/supply-chain", position: "top", label: "Supply" },
    { icon: Settings, path: "/dashboard/settings", position: "bottom", label: "Settings" },
    { icon: User, path: "/dashboard/profile", position: "bottom", label: "Profile" },
  ];

  // For mobile view, show all items in a horizontal layout
  if (isMobile) {
    return (
      <div className="w-full flex items-center justify-around py-2">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center p-1",
              isActive(item.path)
                ? "text-agrigreen"
                : "text-gray-500"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    );
  }

  // Desktop sidebar view (vertical)
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
