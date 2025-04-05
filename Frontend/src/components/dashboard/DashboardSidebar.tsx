import { Home, BookOpen, Clock, Settings, User, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  const sidebarItems = [
    { icon: Home, path: "/dashboard", position: "top" },
    { icon: BookOpen, path: "/dashboard/reports", position: "top" },
    { icon: Clock, path: "/dashboard/schedule", position: "top" },
    { icon: Settings, path: "/dashboard/settings", position: "bottom" },
    { icon: User, path: "/dashboard/profile", position: "bottom" },
  ];

  return (
    <div className="bg-white shadow rounded-lg flex flex-col items-center justify-between py-4 h-full min-h-[calc(100vh-32px)]">
      <div className="flex flex-col items-center space-y-6">
        {sidebarItems
          .filter(item => item.position === "top")
          .map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isActive(item.path) ? "bg-agrigreen" : "hover:bg-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive(item.path) ? "text-white" : "text-gray-400"
                )}
              />
            </Link>
          ))}
      </div>
      <div className="flex flex-col items-center space-y-6">
        {sidebarItems
          .filter(item => item.position === "bottom")
          .map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isActive(item.path) ? "bg-agrigreen" : "hover:bg-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5",
                  isActive(item.path) ? "text-white" : "text-gray-400"
                )}
              />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default DashboardSidebar;
