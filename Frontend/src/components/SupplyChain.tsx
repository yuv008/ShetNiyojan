import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Truck, TrendingUp, Send, DollarSign, Globe, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHeader from './common/DashboardHeader';

interface OptimizationResult {
  current_city: string;
  best_city: string;
  best_net_profit: number;
  recommend_transport: boolean;
  city_details: {
    [city: string]: {
      price_per_kg: number;
      transport_cost: number;
      net_profit: number;
    };
  };
}

const SupplyChain: React.FC = () => {
  const [currentCity, setCurrentCity] = useState<string>('Mumbai');
  const [crop, setCrop] = useState<string>('Rice');
  const [cropWeight, setCropWeight] = useState<string>('100');
  const [cities, setCities] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch cities and commodities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cities
        const citiesResponse = await axios.get('http://localhost:5000/api/cities');
        if (citiesResponse.data && citiesResponse.data.cities) {
          setCities(citiesResponse.data.cities);
        }

        // Fetch commodities
        const commoditiesResponse = await axios.get('http://localhost:5000/api/commodities');
        if (commoditiesResponse.data && commoditiesResponse.data.commodities) {
          setCommodities(commoditiesResponse.data.commodities);
          // Set first commodity as default if available
          if (commoditiesResponse.data.commodities.length > 0) {
            setCrop(commoditiesResponse.data.commodities[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
        // Set some default values if API calls fail
        setCities(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']);
        setCommodities(['Rice', 'Wheat', 'Maize', 'Potato', 'Onion', 'Tomato']);
      }
    };

    fetchData();
  }, []);

  const handleOptimize = async () => {
    if (!currentCity || !crop || !cropWeight || parseFloat(cropWeight) <= 0) {
      toast.error('Please fill all fields with valid values');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/optimize-transport', {
        current_city: currentCity,
        crop: crop,
        crop_weight_kg: parseFloat(cropWeight)
      });

      if (response.data && response.data.optimization_result) {
        setOptimizationResult(response.data.optimization_result);
        // Check if map URL is available
        if (response.data.map_url) {
          setMapUrl(response.data.map_url);
        }
      } else {
        toast.error('Received invalid response from server');
      }
    } catch (error) {
      console.error('Error optimizing transport:', error);
      toast.error('Failed to optimize transport route');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMap = () => {
    setShowMap(true);
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
          <div className="col-span-11">
            <h1 className="text-2xl font-bold text-agrigreen mb-6">Supply Chain Optimization</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Input Section */}
              <Card className="p-6 col-span-1">
                <h2 className="text-lg font-semibold mb-4">Optimize Your Crop Transport</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current City</label>
                    <Select value={currentCity} onValueChange={setCurrentCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Crop</label>
                    <Select value={crop} onValueChange={setCrop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {commodities.map(commodity => (
                          <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Crop Weight (kg)</label>
                    <Input
                      type="number"
                      value={cropWeight}
                      onChange={(e) => setCropWeight(e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleOptimize} 
                    className="w-full bg-agrigreen hover:bg-agrigreen-dark"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Optimize Transport
                      </>
                    )}
                  </Button>
                </div>
              </Card>
              
              {/* Results Section */}
              <Card className="p-6 col-span-1 md:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Optimization Results</h2>
                
                {optimizationResult ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-500 text-sm">Current Location</div>
                        <div className="font-medium text-lg flex items-center">
                          <Globe className="h-4 w-4 text-blue-500 mr-1" />
                          {optimizationResult.current_city}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-500 text-sm">Best Destination</div>
                        <div className="font-medium text-lg flex items-center">
                          <Globe className="h-4 w-4 text-green-500 mr-1" />
                          {optimizationResult.best_city}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-500 text-sm">Best Net Profit</div>
                        <div className="font-medium text-lg text-green-600 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(optimizationResult.best_net_profit)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6 p-4 rounded-lg border border-l-4 border-l-blue-500 bg-blue-50">
                      <h3 className="font-medium mb-1">Recommendation</h3>
                      <p className="text-gray-700">
                        {optimizationResult.recommend_transport 
                          ? `Transport your ${crop} (${cropWeight} kg) to ${optimizationResult.best_city} for maximum profit.`
                          : `Sell your ${crop} (${cropWeight} kg) locally in ${optimizationResult.current_city} for maximum profit.`
                        }
                      </p>
                      <div className="mt-3 flex gap-2">
                        {optimizationResult.recommend_transport && (
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                            <Truck className="mr-2 h-4 w-4" />
                            Plan Route
                          </Button>
                        )}
                        {mapUrl && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-500 text-blue-500 hover:bg-blue-50"
                            onClick={handleViewMap}
                          >
                            <MapIcon className="mr-2 h-4 w-4" />
                            View on Map
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-medium mb-2">Price Details by City</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 px-3 text-left">City</th>
                            <th className="py-2 px-3 text-right">Price per kg</th>
                            <th className="py-2 px-3 text-right">Transport Cost</th>
                            <th className="py-2 px-3 text-right">Net Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(optimizationResult.city_details).map(([city, details]) => (
                            <tr key={city} className={city === optimizationResult.best_city ? "bg-green-50" : ""}>
                              <td className="py-2 px-3 border-t">{city}</td>
                              <td className="py-2 px-3 border-t text-right">{formatCurrency(details.price_per_kg)}</td>
                              <td className="py-2 px-3 border-t text-right">{formatCurrency(details.transport_cost)}</td>
                              <td className={`py-2 px-3 border-t text-right font-medium ${
                                city === optimizationResult.best_city ? "text-green-600" : ""
                              }`}>
                                {formatCurrency(details.net_profit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      * Prices and transport costs are updated in real-time from the Mandi API.
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <TrendingUp className="mb-3 h-12 w-12 opacity-20" />
                    <p>Enter your information and click "Optimize Transport" to see results.</p>
                  </div>
                )}
              </Card>
            </div>
            
            {/* Map View Section */}
            {showMap && mapUrl && (
              <Card className="p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Transport Route Map</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowMap(false)}
                  >
                    Close Map
                  </Button>
                </div>
                <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200">
                  <iframe 
                    src={`http://localhost:5000${mapUrl}`} 
                    className="w-full h-full" 
                    title="Transport Optimization Map"
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChain; 