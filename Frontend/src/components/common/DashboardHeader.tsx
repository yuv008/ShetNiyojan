import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LanguageSelector from "./LanguageSelector";
import logoImage from "@/assets/logo.png";

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const DashboardHeader = ({ searchQuery, onSearchChange }: DashboardHeaderProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm mb-4">
      <div className="flex items-center">
        <div className="mr-3">
          <img src={logoImage} alt="ShetNiyojan Logo" className="h-10 w-auto" />
        </div>
        <h1 className="text-xl font-semibold">ShetNiyojan Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white border-none shadow-sm rounded-lg"
          />
        </div>
        
        <LanguageSelector />

        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Bell className="w-4 h-4" />
          <span className="text-sm">3 Alert</span>
        </Button>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
          <div className="text-sm">
            <div className="font-medium">{user?.fullname || "User"}</div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 