import { useState, useEffect } from "react";
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
import { yields as yieldsApi, auth, YieldData } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import LanguageSelector from "@/components/common/LanguageSelector";

// Define the Yield type
interface Yield {
  id: string;
  name: string;
  acres: number;
  status: "growing" | "harvested" | "planning";
  health: number;
  plantDate: string;
  userId: string;
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddYieldModal, setShowAddYieldModal] = useState(false);
  const [userYields, setUserYields] = useState<Yield[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch user's yields when component mounts
  useEffect(() => {
    const fetchYields = async () => {
      try {
        setLoading(true);
        const response = await yieldsApi.getAll();
        console.log("Fetched yields:", response);
        setUserYields(response);
      } catch (error) {
        console.error("Error fetching yields:", error);
        toast({
          title: "Error",
          description: "Failed to load your yields. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchYields();
    }
  }, [user, toast]);
  
  const handleAddYield = async (data: { name: string; acres: number; mobileno: string }) => {
    try {
      // Simplified yield data - just name, acres and mobile number
      const yieldData = {
        name: data.name,
        acres: data.acres,
        mobileno: data.mobileno
      };
      
      console.log("Sending data to API:", yieldData);
      
      // Call API directly instead of using yields API
      const response = await fetch("http://localhost:5000/api/yields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(yieldData)
      });
      
      const result = await response.json();
      console.log("API response:", result);
      
      if (!response.ok) {
        console.error("Error response:", response.status, result);
        throw new Error(result.error || "Failed to add yield");
      }
      
      // Update local state with the new yield from the server
      setUserYields(prevYields => [...prevYields, result]);
      
      toast({
        title: "Yield Added",
        description: `Added ${data.name} (${data.acres} acres) to current season`,
      });
      
      setShowAddYieldModal(false);
    } catch (error) {
      console.error("Error adding yield:", error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to add yield. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteYield = async (yieldId: string) => {
    try {
      await yieldsApi.delete(yieldId);
      
      // Update local state
      setUserYields(prevYields => prevYields.filter(y => y.id !== yieldId));
      
      toast({
        title: "Yield Deleted",
        description: "Yield has been successfully deleted",
      });
    } catch (error) {
      console.error("Error deleting yield:", error);
      toast({
        title: "Error",
        description: "Failed to delete yield. Please try again.",
        variant: "destructive",
      });
    }
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

  const handleNavigateToMarketplace = () => {
    navigate('/marketplace');
  };

  const handleNavigateToLeaseMarketPlace = () => {
    navigate('/leasemarket');
  }

  return (
    <div className="bg-agriBg min-h-screen w-full">
      <div className="w-full h-full p-4">
        <DashboardHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="col-span-1 h-[calc(100vh-2rem)]">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-11 grid grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="col-span-2 space-y-4">
              {/* Location and Weather */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-lg">Current Yields</h2>
                  <Button variant="outline" size="sm" onClick={() => setShowAddYieldModal(true)} className="flex items-center">
                    <span className="mr-1">New</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agrigreen"></div>
                    </div>
                  ) : userYields.length > 0 ? (
                    userYields.map(yieldItem => (
                      <div 
                        key={yieldItem.id}
                        className="flex items-center p-3 bg-agrigreen/5 rounded-lg border border-agrigreen/20 cursor-pointer hover:bg-agrigreen/10 transition-colors"
                        onClick={() => handleYieldClick(yieldItem.id)}
                      >
                        <div className="bg-agrigreen/10 p-2 rounded-full mr-3">
                          <Leaf className="w-5 h-5 text-agrigreen" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{yieldItem.name}</h3>
                          <div className="flex text-xs text-muted-foreground">
                            <span>{yieldItem.acres} acres</span>
                            <span className="mx-2">•</span>
                            <span>Status: {yieldItem.status}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          yieldItem.status === 'growing' ? 'bg-green-500/10 text-green-600' :
                          yieldItem.status === 'harvested' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {yieldItem.status.charAt(0).toUpperCase() + yieldItem.status.slice(1)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No yields added yet. Click "New" to add your first yield.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Garden Info */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-lg">Features</h2>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Crop Health Monitoring & Disease Detection */}
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                    onClick={handleNavigateToCropHealthMonitoring}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-agrigreen/10 p-4 rounded-full mb-3">
                        <Leaf className="w-8 h-8 text-agrigreen" />
                      </div>
                      <h3 className="font-medium text-base mb-1">Crop Health Monitoring</h3>
                      <p className="text-xs text-muted-foreground">Disease detection & health tracking</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                  </Card>

                  {/* AI-Based Crop Prediction - Modified with onClick handler */}
                  <Card 
                    className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                    onClick={handleNavigateToCropPrediction}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-blue-500/10 p-4 rounded-full mb-3">
                        <Activity className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="font-medium text-base mb-1">AI-Based Prediction</h3>
                      <p className="text-xs text-muted-foreground">Yield optimization & forecasting</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </Card>

                  {/* Smart Irrigation */}
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-cyan-500/10 p-4 rounded-full mb-3">
                        <Droplets className="w-8 h-8 text-cyan-500" />
                      </div>
                      <h3 className="font-medium text-base mb-1">Smart Irrigation</h3>
                      <p className="text-xs text-muted-foreground">Water optimization & scheduling</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-cyan-500 rounded-full"></div>
                    </div>
                  </Card>

                  {/* Market & Supply Chain */}
                  <Card 
                    className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                    onClick={handleNavigateToMarketplace}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-agriorange/10 p-4 rounded-full mb-3">
                        <AlertTriangle className="w-8 h-8 text-agriorange" />
                      </div>
                      <h3 className="font-medium text-base mb-1">Marketplace</h3>
                      <p className="text-xs text-muted-foreground">Find nearby markets & supplies</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-agriorange rounded-full"></div>
                    </div>
                  </Card>

                  {/* Supply Chain Management */}
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                  
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-purple-500/10 p-4 rounded-full mb-3">
                        <Clock className="w-8 h-8 text-purple-500" />
                      </div>
                      <h3 className="font-medium text-base mb-1">Supply Chain</h3>
                      <p className="text-xs text-muted-foreground">Order tracking & logistics</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                    </div>
                  </Card>

                  {/* Lease Marketplace */}
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                   onClick={handleNavigateToLeaseMarketPlace}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-pink-500/10 p-4 rounded-full mb-3">
                        <MapPin className="w-8 h-8 text-pink-500" />
                      </div>
                      <h3 className="font-medium text-base mb-1">Lease Marketplace</h3>
                      <p className="text-xs text-muted-foreground">Equipment rental & sharing</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-pink-500 rounded-full"></div>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="col-span-1 space-y-4">
              {/* Current Season Card */}
              <Card className="p-4">
                <h3 className="font-medium mb-4">Current Season</h3>
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-agrigreen">{userYields.length}</div>
                  <div className="text-sm text-muted-foreground mt-2">Active Yields</div>
                </div>
                <Button 
                  onClick={() => setShowAddYieldModal(true)}
                  className="w-full bg-agrigreen hover:bg-agrigreen-dark"
                >
                  Add New Yield
                </Button>
              </Card>

              {/* Activity Log */}
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Recent Activity</h3>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </div>
                <ActivityLog />
              </Card>

              {/* Device List */}
              <Card className="p-4">
                <h3 className="font-medium mb-2">Device</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-100 rounded p-2">
                    <span className="text-xs text-muted-foreground">Sensor</span>
                    <p className="font-medium">4</p>
                  </div>
                  <div className="bg-gray-100 rounded p-2">
                    <span className="text-xs text-muted-foreground">Camera</span>
                    <p className="font-medium">5</p>
                  </div>
                </div>

                {/* Sensor Status */}
                <div className="space-y-3">
                  <SensorStatus 
                    name="JLNew H10: Soil Moisture Sensor"
                    id="SM201" 
                    type="Sensor" 
                    status="online" 
                  />
                  <SensorStatus 
                    name="HC T200 Wind Sensor"
                    id="WS004" 
                    type="Sensor" 
                    status="online" 
                  />
                  <SensorStatus 
                    name="ACE Temperature & Humidity Sensor"
                    id="TH011" 
                    type="Sensor" 
                    status="warning"
                    warning="Signal issue since 08:02 AM"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Add Yield Modal */}
        {showAddYieldModal && (
          <YieldModal 
            onClose={() => setShowAddYieldModal(false)}
            onSubmit={handleAddYield}
          />
        )}

        {/* Floating language selector */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sensor Status Component
interface SensorStatusProps {
  name: string;
  id: string;
  type: string;
  status: "online" | "offline" | "warning";
  warning?: string;
}

const SensorStatus = ({ name, id, type, status, warning }: SensorStatusProps) => {
  return (
    <div className="bg-gray-100 rounded-lg p-3">
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${
          status === 'online' ? 'bg-green-500' : 
          status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`}></div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{name}</h4>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>#{id}</span>
            <span className="mx-2">•</span>
            <span>{type}</span>
          </div>
        </div>
        {warning && (
          <div className="flex items-center text-xs text-yellow-500">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>{warning}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;