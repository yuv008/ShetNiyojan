import { Search, User, Menu } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white rounded-lg shadow-sm mb-4">
      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center p-4">
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
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
            <div className="text-sm hidden sm:block">
              <div className="font-medium">{user?.fullname || "User"}</div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center">
            <img src={logoImage} alt="ShetNiyojan Logo" className="h-8 w-auto mr-2" />
            <h1 className="text-lg font-semibold">ShetNiyojan</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="p-3 border-t border-gray-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white border shadow-sm rounded-lg w-full"
              />
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium">{user?.fullname || "User"}</span>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-xs px-3"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader; 