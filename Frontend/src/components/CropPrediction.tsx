import React, { useState, ChangeEvent, FormEvent } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/common/DashboardHeader';

// Define types
type SoilType = 'clay' | 'sandy' | 'loam' | 'silt' | 'peaty' | 'chalky' | 'loamy';

interface FormDataType {
  location: string;
  soilType: SoilType;
  rainfall: number;
  temperature: number;
  humidity: number;
  ph: number;
  N: number;
  P: number;
  K: number;
  landArea: number;
}

interface CropInfo {
  crop: string;
  growthPeriod: string;
  suitabilityScore: string;
  waterRequirement: string;
}

interface PredictionResult {
  bestRecommendedCrop: string;
  additionalCrops: CropInfo[];
  alternativeCrops: string[];
  environmentalSuitability: string;
  estimatedYield: string;
  recommendations: string;
}

const CropPrediction: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    location: '',
    soilType: 'loam',
    rainfall: 100,
    temperature: 25,
    humidity: 60,
    ph: 7.0,
    N: 40,
    P: 40,
    K: 40,
    landArea: 1,
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const soilTypes: SoilType[] = ['clay', 'sandy', 'loam', 'silt', 'peaty', 'chalky', 'loamy'];
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'location' || name === 'soilType' ? value : parseFloat(value) || value
    }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const apiData = {
        N: formData.N,
        P: formData.P,
        K: formData.K,
        temperature: formData.temperature,
        humidity: formData.humidity,
        ph: formData.ph,
        rainfall: formData.rainfall,
        location: formData.location
      };
      
      console.log("Sending data to API:", apiData);
      
      const response = await fetch("http://localhost:5000/api/crop-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("userToken") || ""
        },
        body: JSON.stringify(apiData)
      });
      
      const result = await response.json();
      console.log("API response:", result);
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to get crop recommendation");
      }
      
      const predictionResult: PredictionResult = {
        bestRecommendedCrop: result.bestRecommendedCrop,
        additionalCrops: result.additionalCrops.map((crop: any) => ({
          crop: crop.crop,
          growthPeriod: crop.growthPeriod,
          suitabilityScore: crop.suitabilityScore,
          waterRequirement: crop.waterRequirement
        })),
        alternativeCrops: result.alternativeCrops,
        environmentalSuitability: result.environmentalSuitability,
        estimatedYield: result.estimatedYield,
        recommendations: result.recommendations
      };
      
      setPrediction(predictionResult);
    } catch (error) {
      console.error("Error getting crop recommendation:", error);
      alert("Failed to get crop recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = (): void => {
    setFormData({
      location: '',
      soilType: 'loam',
      rainfall: 100,
      temperature: 25,
      humidity: 60,
      ph: 7.0,
      N: 40,
      P: 40,
      K: 40,
      landArea: 1,
    });
    setPrediction(null);
  };

  return (
    <div className="bg-agriBg min-h-screen w-full">
      <div className="w-full h-full p-2 sm:p-4">
        <DashboardHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
          {/* Sidebar - Hidden on mobile, visible on md screens and up */}
          <div className="hidden md:block md:col-span-1">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-1 md:col-span-11">
            <div className="w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-agrigreen p-4 sm:p-6 text-white">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">CropSmart Advisor</h1>
                <p className="text-center mt-1 sm:mt-2 text-sm sm:text-base text-agrigreen-light">Find the optimal crop for your specific location and conditions</p>
              </div>
              
              <div className="p-3 sm:p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Location Input */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter your location"
                        className="w-full p-1.5 sm:p-2 text-sm sm:text-base border border-agrigreen-light rounded focus:ring-2 focus:ring-agrigreen focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    
                    {/* Soil Type */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                      <select
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleChange}
                        className="w-full p-1.5 sm:p-2 text-sm sm:text-base border border-agrigreen-light rounded focus:ring-2 focus:ring-agrigreen focus:border-transparent outline-none"
                      >
                        {soilTypes.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Land Area */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Land Area (Hectares)</label>
                      <input
                        type="number"
                        name="landArea"
                        value={formData.landArea}
                        onChange={handleChange}
                        min="0.1"
                        step="0.1"
                        className="w-full p-1.5 sm:p-2 text-sm sm:text-base border border-agrigreen-light rounded focus:ring-2 focus:ring-agrigreen focus:border-transparent outline-none"
                      />
                    </div>
                    
                    {/* Climate Factors */}
                    <div className="col-span-1 md:col-span-2">
                      <h3 className="font-medium text-base sm:text-lg text-agrigreen mb-2 sm:mb-3">Climate Factors</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rainfall (mm/month)</label>
                          <input
                            type="range"
                            name="rainfall"
                            min="0"
                            max="500"
                            value={formData.rainfall}
                            onChange={handleChange}
                            className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                          />
                          <div className="text-center text-xs sm:text-sm mt-1">{formData.rainfall} mm</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                          <input
                            type="range"
                            name="temperature"
                            min="-10"
                            max="50"
                            value={formData.temperature}
                            onChange={handleChange}
                            className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                          />
                          <div className="text-center text-xs sm:text-sm mt-1">{formData.temperature} °C</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                          <input
                            type="range"
                            name="humidity"
                            min="0"
                            max="100"
                            value={formData.humidity}
                            onChange={handleChange}
                            className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                          />
                          <div className="text-center text-xs sm:text-sm mt-1">{formData.humidity}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Soil Properties */}
                    <div className="col-span-1 md:col-span-2">
                      <h3 className="font-medium text-base sm:text-lg text-agrigreen mb-2 sm:mb-3">Soil Properties</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Soil pH</label>
                          <input
                            type="range"
                            name="ph"
                            min="3"
                            max="10"
                            step="0.1"
                            value={formData.ph}
                            onChange={handleChange}
                            className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                          />
                          <div className="text-center text-xs sm:text-sm mt-1">{formData.ph}</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nitrogen (kg/ha)</label>
                          <input
                            type="range"
                            name="N"
                            min="0"
                            max="100"
                            value={formData.N}
                            onChange={handleChange}
                            className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                          />
                          <div className="text-center text-xs sm:text-sm mt-1">{formData.N}</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phosphorus (kg/ha)</label>
                          <input
                            type="range"
                            name="P"
                            min="0"
                            max="100"
                            value={formData.P}
                            onChange={handleChange}
                            className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                          />
                          <div className="text-center text-xs sm:text-sm mt-1">{formData.P}</div>
                        </div>
                        
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Potassium (kg/ha)</label>
                          <input
                            type="range"
                            name="K"
                            min="0"
                            max="100"
                            value={formData.K}
                            onChange={handleChange}
                            className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                          />
                          <div className="text-center text-xs sm:text-sm mt-1">{formData.K}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-3 sm:space-x-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm bg-agrigreen-light/10 text-agrigreen border border-agrigreen-light rounded-md hover:bg-agrigreen-light/20 transition"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm bg-agrigreen text-white rounded-md hover:bg-agrigreen-dark transition"
                      disabled={loading}
                    >
                      {loading ? 'Analyzing...' : 'Predict Best Crop'}
                    </button>
                  </div>
                </form>
                
                {/* Results Section */}
                {prediction && (
                  <div className="mt-6 sm:mt-8 border-t border-agrigreen-light pt-4 sm:pt-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-agrigreen mb-3 sm:mb-4">Crop Recommendation Results</h2>
                    
                    <div className="bg-agrigreen-light/10 p-3 sm:p-4 rounded-lg border border-agrigreen-light mb-5 sm:mb-6">
                      <div className="text-center mb-3 sm:mb-4">
                        <span className="text-base sm:text-lg font-medium">Best Recommended Crop:</span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-agrigreen">{prediction.bestRecommendedCrop}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <h4 className="font-medium text-sm sm:text-base text-agrigreen mb-1 sm:mb-2">Environmental Suitability</h4>
                          <p className="text-xs sm:text-sm">{prediction.environmentalSuitability}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm sm:text-base text-agrigreen mb-1 sm:mb-2">Estimated Yield</h4>
                          <p className="text-xs sm:text-sm">{prediction.estimatedYield}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-4">
                        <h4 className="font-medium text-sm sm:text-base text-agrigreen mb-1 sm:mb-2">Recommendations</h4>
                        <p className="text-xs sm:text-sm">{prediction.recommendations}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium text-agrigreen mb-2 sm:mb-3">Additional Crop Options</h3>
                      <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <div className="inline-block min-w-full sm:px-0 px-3">
                          <table className="min-w-full bg-white border border-agrigreen-light text-xs sm:text-sm">
                            <thead className="bg-agrigreen-light/10">
                              <tr>
                                <th className="py-1.5 sm:py-2 px-2 sm:px-4 border-b text-left">Crop</th>
                                <th className="py-1.5 sm:py-2 px-2 sm:px-4 border-b text-left">Suitability Score</th>
                                <th className="py-1.5 sm:py-2 px-2 sm:px-4 border-b text-left">Water Requirement</th>
                                <th className="py-1.5 sm:py-2 px-2 sm:px-4 border-b text-left">Growth Period</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prediction.additionalCrops.map((crop, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-agrigreen-light/5' : 'bg-white'}>
                                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 border-b">{crop.crop}</td>
                                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 border-b">{crop.suitabilityScore}%</td>
                                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 border-b">{crop.waterRequirement}</td>
                                  <td className="py-1.5 sm:py-2 px-2 sm:px-4 border-b">{crop.growthPeriod}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg sm:text-xl font-medium text-agrigreen mb-2 sm:mb-3">Alternative Crops</h3>
                      <div className="flex flex-wrap gap-2">
                        {prediction.alternativeCrops.map((crop, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-agrigreen-light/10 text-agrigreen rounded-full text-xs sm:text-sm"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-4 sm:mt-8 text-center text-agrigreen text-xs sm:text-sm">
              <p>© 2025 CropSmart Advisor | Helping farmers make data-driven decisions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sidebar - Visible only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-around py-2">
          <DashboardSidebar isMobile={true} />
        </div>
      </div>
    </div>
  );
};

export default CropPrediction;