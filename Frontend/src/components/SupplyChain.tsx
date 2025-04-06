import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Truck, TrendingUp, Send, DollarSign, Globe, Map as MapIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHeader from './common/DashboardHeader';

// Local data for cities near Pune
const citiesData = [
  { name: "Pune", coordinates: [18.5204, 73.8567] },
  { name: "Mumbai", coordinates: [19.0760, 72.8777] },
  { name: "Nashik", coordinates: [19.9975, 73.7898] },
  { name: "Solapur", coordinates: [17.6599, 75.9064] },
  { name: "Kolhapur", coordinates: [16.7050, 74.2433] },
  { name: "Aurangabad", coordinates: [19.8762, 75.3433] }
];

// Local data for commodities
const commoditiesData = [
  "Rice", "Wheat", "Maize", "Potato", "Onion", "Tomato", 
  "Soybean", "Sugarcane", "Cotton", "Jowar", "Bajra"
];

// Local price data (per kg) for each city and commodity
const priceData = {
  "Rice": {
    "Pune": 42,
    "Mumbai": 45,
    "Nashik": 40,
    "Solapur": 38,
    "Kolhapur": 41,
    "Aurangabad": 39
  },
  "Wheat": {
    "Pune": 35,
    "Mumbai": 38,
    "Nashik": 33,
    "Solapur": 32,
    "Kolhapur": 34,
    "Aurangabad": 31
  },
  "Maize": {
    "Pune": 28,
    "Mumbai": 30,
    "Nashik": 27,
    "Solapur": 26,
    "Kolhapur": 29,
    "Aurangabad": 25
  },
  "Potato": {
    "Pune": 22,
    "Mumbai": 25,
    "Nashik": 20,
    "Solapur": 21,
    "Kolhapur": 23,
    "Aurangabad": 19
  },
  "Onion": {
    "Pune": 32,
    "Mumbai": 35,
    "Nashik": 28,
    "Solapur": 30,
    "Kolhapur": 31,
    "Aurangabad": 29
  },
  "Tomato": {
    "Pune": 25,
    "Mumbai": 28,
    "Nashik": 23,
    "Solapur": 24,
    "Kolhapur": 26,
    "Aurangabad": 22
  },
  "Soybean": {
    "Pune": 45,
    "Mumbai": 48,
    "Nashik": 43,
    "Solapur": 42,
    "Kolhapur": 44,
    "Aurangabad": 41
  },
  "Sugarcane": {
    "Pune": 3.5,
    "Mumbai": 3.8,
    "Nashik": 3.2,
    "Solapur": 3.3,
    "Kolhapur": 3.6,
    "Aurangabad": 3.1
  },
  "Cotton": {
    "Pune": 65,
    "Mumbai": 68,
    "Nashik": 63,
    "Solapur": 62,
    "Kolhapur": 64,
    "Aurangabad": 61
  },
  "Jowar": {
    "Pune": 30,
    "Mumbai": 32,
    "Nashik": 28,
    "Solapur": 27,
    "Kolhapur": 29,
    "Aurangabad": 26
  },
  "Bajra": {
    "Pune": 32,
    "Mumbai": 34,
    "Nashik": 30,
    "Solapur": 29,
    "Kolhapur": 31,
    "Aurangabad": 28
  }
};

// Distance between cities in km
const distanceData = {
  "Pune": {
    "Pune": 0,
    "Mumbai": 150,
    "Nashik": 210,
    "Solapur": 250,
    "Kolhapur": 230,
    "Aurangabad": 235
  },
  "Mumbai": {
    "Pune": 150,
    "Mumbai": 0,
    "Nashik": 170,
    "Solapur": 400,
    "Kolhapur": 380,
    "Aurangabad": 340
  },
  "Nashik": {
    "Pune": 210,
    "Mumbai": 170,
    "Nashik": 0,
    "Solapur": 370,
    "Kolhapur": 420,
    "Aurangabad": 180
  },
  "Solapur": {
    "Pune": 250,
    "Mumbai": 400,
    "Nashik": 370,
    "Solapur": 0,
    "Kolhapur": 220,
    "Aurangabad": 280
  },
  "Kolhapur": {
    "Pune": 230,
    "Mumbai": 380,
    "Nashik": 420,
    "Solapur": 220,
    "Kolhapur": 0,
    "Aurangabad": 390
  },
  "Aurangabad": {
    "Pune": 235,
    "Mumbai": 340,
    "Nashik": 180,
    "Solapur": 280,
    "Kolhapur": 390,
    "Aurangabad": 0
  }
};

// Transport cost per km per kg (in rupees)
const transportCostPerKmPerKg = 0.02;

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
  const [currentCity, setCurrentCity] = useState<string>('Pune');
  const [crop, setCrop] = useState<string>('Rice');
  const [cropWeight, setCropWeight] = useState<string>('100');
  const [loading, setLoading] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleOptimize = () => {
    if (!currentCity || !crop || !cropWeight || parseFloat(cropWeight) <= 0) {
      toast.error('Please fill all fields with valid values');
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        const cropWeightKg = parseFloat(cropWeight);
        const cityDetails: { [city: string]: any } = {};
        let bestCity = currentCity;
        let bestNetProfit = 0;
        
        // Calculate profits for each city
        citiesData.forEach(cityData => {
          const city = cityData.name;
          const pricePerKg = priceData[crop][city];
          const distance = distanceData[currentCity][city];
          const transportCost = distance * transportCostPerKmPerKg * cropWeightKg;
          
          // For current city, no transport cost
          const netProfit = city === currentCity 
            ? pricePerKg * cropWeightKg 
            : (pricePerKg * cropWeightKg) - transportCost;
          
          cityDetails[city] = {
            price_per_kg: pricePerKg,
            transport_cost: city === currentCity ? 0 : transportCost,
            net_profit: netProfit
          };
          
          // Update best city if profit is higher
          if (netProfit > bestNetProfit) {
            bestNetProfit = netProfit;
            bestCity = city;
          }
        });
        
        // Create optimization result
        const result: OptimizationResult = {
          current_city: currentCity,
          best_city: bestCity,
          best_net_profit: bestNetProfit,
          recommend_transport: bestCity !== currentCity,
          city_details: cityDetails
        };
        
        setOptimizationResult(result);
        toast.success('Transport optimization completed');
      } catch (error) {
        console.error('Error during optimization:', error);
        toast.error('Failed to optimize transport route');
      } finally {
        setLoading(false);
      }
    }, 1000); // Simulate 1 second delay for processing
  };

  const handleViewMap = () => {
    setShowMap(true);
  };

  // Function to get city coordinates 
  const getCityCoordinates = (cityName: string) => {
    const city = citiesData.find(city => city.name === cityName);
    return city ? city.coordinates : [0, 0];
  };

  // Function to normalize coordinates for the SVG viewport
  const normalizeCoordinates = (lat: number, lng: number) => {
    // Define bounds for Maharashtra region
    const minLat = 16.0; // Southern boundary
    const maxLat = 20.5; // Northern boundary
    const minLng = 72.5; // Western boundary
    const maxLng = 76.0; // Eastern boundary
    
    // Calculate normalized position (0-100%)
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Invert Y axis
    
    return [x, y];
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
                        {citiesData.map(city => (
                          <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
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
                        {commoditiesData.map(commodity => (
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
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                          onClick={handleViewMap}
                        >
                          <MapIcon className="mr-2 h-4 w-4" />
                          View on Map
                        </Button>
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
                              <td className="py-2 px-3 border-t text-right">₹{details.price_per_kg.toFixed(2)}</td>
                              <td className="py-2 px-3 border-t text-right">₹{details.transport_cost.toFixed(2)}</td>
                              <td className={`py-2 px-3 border-t text-right font-medium ${
                                city === optimizationResult.best_city ? "text-green-600" : ""
                              }`}>
                                ₹{details.net_profit.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      * Price and transport cost data is based on local market estimates for cities near Pune.
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
            {showMap && optimizationResult && (
              <Card className="p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Transport Route Map</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowMap(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Close Map
                  </Button>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 relative h-[600px]">
                  {/* Maharashtra map visualization */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-50 rounded-lg overflow-hidden">
                    {/* Map container */}
                    <div className="relative w-full h-full">
                      {/* Map background - Maharashtra outline */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <svg width="80%" height="80%" viewBox="0 0 100 100">
                          {/* Simplified Maharashtra outline */}
                          <path 
                            d="M20,20 L80,15 L85,40 L70,80 L30,85 L15,60 Z" 
                            fill="#e5e7eb" 
                            stroke="#9ca3af" 
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                      
                      {/* Cities */}
                      <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
                        {/* City markers */}
                        {citiesData.map(city => {
                          const [lat, lng] = city.coordinates;
                          const [x, y] = normalizeCoordinates(lat, lng);
                          
                          return (
                            <g key={city.name}>
                              {/* City marker */}
                              <circle 
                                cx={x} 
                                cy={y} 
                                r={city.name === optimizationResult.current_city ? 1.5 : 
                                   city.name === optimizationResult.best_city ? 1.5 : 1}
                                fill={city.name === optimizationResult.current_city ? "#3b82f6" : 
                                      city.name === optimizationResult.best_city ? "#10b981" : "#6b7280"}
                                stroke="#fff"
                                strokeWidth="0.5"
                              />
                              
                              {/* City label */}
                              <text 
                                x={x} 
                                y={y - 2} 
                                fontSize="2"
                                textAnchor="middle" 
                                fill={city.name === optimizationResult.current_city ? "#3b82f6" : 
                                      city.name === optimizationResult.best_city ? "#10b981" : "#6b7280"}
                                fontWeight={city.name === optimizationResult.current_city || 
                                            city.name === optimizationResult.best_city ? "bold" : "normal"}
                              >
                                {city.name}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Route line between current city and best city */}
                        {optimizationResult.recommend_transport && (
                          (() => {
                            const [startLat, startLng] = getCityCoordinates(optimizationResult.current_city);
                            const [endLat, endLng] = getCityCoordinates(optimizationResult.best_city);
                            const [startX, startY] = normalizeCoordinates(startLat, startLng);
                            const [endX, endY] = normalizeCoordinates(endLat, endLng);
                            
                            return (
                              <g>
                                {/* Route line */}
                                <line 
                                  x1={startX} 
                                  y1={startY} 
                                  x2={endX} 
                                  y2={endY} 
                                  stroke="#3b82f6" 
                                  strokeWidth="0.5" 
                                  strokeDasharray="1,1"
                                />
                                
                                {/* Direction arrow */}
                                <polygon 
                                  points={`${endX-1},${endY} ${endX},${endY-1} ${endX+1},${endY}`}
                                  fill="#3b82f6"
                                  transform={`rotate(90, ${endX}, ${endY})`}
                                />
                              </g>
                            );
                          })()
                        )}
                      </svg>
                      
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-md border border-gray-200">
                        <div className="text-xs font-medium mb-1">Legend</div>
                        <div className="flex items-center text-xs mb-1">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                          <span>Current City ({optimizationResult.current_city})</span>
                        </div>
                        <div className="flex items-center text-xs mb-1">
                          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                          <span>Best Destination ({optimizationResult.best_city})</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="h-3 w-3 rounded-full bg-gray-500 mr-2"></div>
                          <span>Other Cities</span>
                        </div>
                      </div>
                      
                      {/* Map information */}
                      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md border border-gray-200">
                        <div className="text-xs font-semibold">Transport Details</div>
                        <div className="text-xs">
                          <div>Distance: {distanceData[optimizationResult.current_city][optimizationResult.best_city]} km</div>
                          <div>Crop: {crop} ({cropWeight} kg)</div>
                          <div>Transport Cost: ₹{optimizationResult.city_details[optimizationResult.best_city].transport_cost.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
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