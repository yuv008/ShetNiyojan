import { useState } from "react";
import { 
  Search, Bell, User, MapPin, ArrowUpRight, 
  Leaf, Sun, Wind, Thermometer, Activity, Droplets, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import YieldModal from "@/components/dashboard/YieldModal";
import { AlertTriangle } from "lucide-react";
import ActivityLog from "@/components/dashboard/ActivityLog";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/common/DashboardHeader";
import CurrentYields from '../components/dashboard/CurrentYields';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddYieldModal, setShowAddYieldModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleAddYield = (data: { name: string; acres: number }) => {
    // In a real app, this would save to a database
    toast({
      title: "Yield Added",
      description: `Added ${data.name} (${data.acres} acres) to current season`,
    });
    setShowAddYieldModal(false);
  };

  const handleYieldClick = (yieldId: string) => {
    navigate(`/yield/${yieldId}`);
  };
  
  const handleNavigateToCropPrediction = () => {
    navigate('/crop-prediction');
  };

  const handleNavigateToCropHealthMonitoring = () => {
    navigate('/crop-health');
  };

  return (
    <div className="bg-agriBg min-h-screen w-full">
      
    </div>
  );
};




export default Dashboard;