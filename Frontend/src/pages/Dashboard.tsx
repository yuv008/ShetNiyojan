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
                  {/* Yield Item */}
                  <div 
                    className="flex items-center p-3 bg-agrigreen/5 rounded-lg border border-agrigreen/20 cursor-pointer hover:bg-agrigreen/10 transition-colors"
                    onClick={() => handleYieldClick("spinach-08")}
                  >
                    <div className="bg-agrigreen/10 p-2 rounded-full mr-3">
                      <Leaf className="w-5 h-5 text-agrigreen" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Spinach Garden 08</h3>
                      <div className="flex text-xs text-muted-foreground">
                        <span>200 acres</span>
                        <span className="mx-2">•</span>
                        <span>12 activities</span>
                      </div>
                    </div>
                    <div className="bg-green-500/10 px-2 py-1 rounded text-xs text-green-600 font-medium">
                      Active
                    </div>
                  </div>
                  
                  {/* Yield Item */}
                  <div 
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleYieldClick("tomato-a2")}
                  >
                    <div className="bg-blue-500/10 p-2 rounded-full mr-3">
                      <Leaf className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Tomato Field A2</h3>
                      <div className="flex text-xs text-muted-foreground">
                        <span>150 acres</span>
                        <span className="mx-2">•</span>
                        <span>8 activities</span>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 px-2 py-1 rounded text-xs text-blue-600 font-medium">
                      Growing
                    </div>
                  </div>
                  
                  {/* Yield Item */}
                  <div 
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleYieldClick("rice-north")}
                  >
                    <div className="bg-purple-500/10 p-2 rounded-full mr-3">
                      <Leaf className="w-5 h-5 text-purple-500" />
                    </div>
                  <div className="flex-1">
                      <h3 className="font-medium">Rice Paddy North</h3>
                      <div className="flex text-xs text-muted-foreground">
                        <span>300 acres</span>
                        <span className="mx-2">•</span>
                        <span>15 activities</span>
                      </div>
                    </div>
                    <div className="bg-purple-500/10 px-2 py-1 rounded text-xs text-purple-600 font-medium">
                      Harvesting
                    </div>
                  </div>

                  {/* Yield Item */}
                  <div 
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleYieldClick("wheat-east")}
                  >
                    <div className="bg-orange-500/10 p-2 rounded-full mr-3">
                      <Leaf className="w-5 h-5 text-orange-500" />
                        </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Wheat Field East</h3>
                      <div className="flex text-xs text-muted-foreground">
                        <span>250 acres</span>
                        <span className="mx-2">•</span>
                        <span>9 activities</span>
                      </div>
                    </div>
                    <div className="bg-orange-500/10 px-2 py-1 rounded text-xs text-orange-600 font-medium">
                      Mature
                    </div>
                  </div>

                  {/* Yield Item */}
                  <div 
                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleYieldClick("corn-south")}
                  >
                    <div className="bg-cyan-500/10 p-2 rounded-full mr-3">
                      <Leaf className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-medium">Corn Field South</h3>
                      <div className="flex text-xs text-muted-foreground">
                        <span>175 acres</span>
                        <span className="mx-2">•</span>
                        <span>5 activities</span>
                      </div>
                    </div>
                    <div className="bg-cyan-500/10 px-2 py-1 rounded text-xs text-cyan-600 font-medium">
                      Planting
                    </div>
                  </div>
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
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-agriorange/10 p-4 rounded-full mb-3">
                        <AlertTriangle className="w-8 h-8 text-agriorange" />
                      </div>
                      <h3 className="font-medium text-base mb-1">Market Management</h3>
                      <p className="text-xs text-muted-foreground">Price tracking & market analysis</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-agriorange rounded-full"></div>
                    </div>
                  </Card>

                  {/* Supply Chain Management */}
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
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
                  <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
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
                  <div className="text-5xl font-bold text-agrigreen">5</div>
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