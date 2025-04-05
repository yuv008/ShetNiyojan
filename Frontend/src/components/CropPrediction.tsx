import React, { useState, ChangeEvent, FormEvent } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

// Define types
type SoilType = 'clay' | 'sandy' | 'loam' | 'silt' | 'peaty' | 'chalky' | 'loamy';

interface FormDataType {
  location: string;
  soilType: SoilType;
  rainfall: number;
  temperature: number;
  humidity: number;
  soilPH: number;
  soilNitrogen: number;
  soilPhosphorus: number;
  soilPotassium: number;
  landArea: number;
}

interface CropInfo {
  name: string;
  score: number;
  waterRequirement: string;
  growthPeriod: string;
}

interface PredictionResult {
  bestCrop: string;
  confidence: number;
  alternativeCrops: CropInfo[];
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
    soilPH: 7.0,
    soilNitrogen: 40,
    soilPhosphorus: 40,
    soilPotassium: 40,
    landArea: 1,
  });
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const soilTypes: SoilType[] = ['clay', 'sandy', 'loam', 'silt', 'peaty', 'chalky', 'loamy'];
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'location' ? value : parseFloat(value) || value
    }));
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate prediction calculation (would be an API call in production)
    setTimeout(() => {
      // Sample prediction logic - this would be replaced with actual ML model results
      const possibleCrops: CropInfo[] = [
        { name: 'Rice', score: 95, waterRequirement: 'High', growthPeriod: '3-4 months' },
        { name: 'Wheat', score: 82, waterRequirement: 'Medium', growthPeriod: '4-5 months' },
        { name: 'Maize', score: 75, waterRequirement: 'Medium', growthPeriod: '3-4 months' }
      ];
      
      setPrediction({
        bestCrop: 'Rice',
        confidence: 95,
        alternativeCrops: possibleCrops,
        environmentalSuitability: 'Excellent',
        estimatedYield: '5-6 tons/hectare',
        recommendations: 'Consider planting in early spring for optimal yield. Requires regular irrigation.'
      });
      
      setLoading(false);
    }, 1500);
  };
  
  const resetForm = (): void => {
    setFormData({
      location: '',
      soilType: 'loam',
      rainfall: 100,
      temperature: 25,
      humidity: 60,
      soilPH: 7.0,
      soilNitrogen: 40,
      soilPhosphorus: 40,
      soilPotassium: 40,
      landArea: 1,
    });
    setPrediction(null);
  };

  return (
    <div className="flex min-h-screen bg-agriBg">
      {/* Sidebar */}
      <div className="w-16 m-3 h-[calc(100vh-2rem)] fixed">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-agrigreen p-6 text-white">
            <h1 className="text-3xl font-bold text-center">CropSmart Advisor</h1>
            <p className="text-center mt-2 text-agrigreen-light">Find the optimal crop for your specific location and conditions</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Location Input */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                    className="w-full p-2 border border-agrigreen-light rounded focus:ring-2 focus:ring-agrigreen focus:border-transparent outline-none"
                    required
                  />
                </div>
                
                {/* Soil Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className="w-full p-2 border border-agrigreen-light rounded focus:ring-2 focus:ring-agrigreen focus:border-transparent outline-none"
                  >
                    {soilTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                {/* Land Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (Hectares)</label>
                  <input
                    type="number"
                    name="landArea"
                    value={formData.landArea}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                    className="w-full p-2 border border-agrigreen-light rounded focus:ring-2 focus:ring-agrigreen focus:border-transparent outline-none"
                  />
                </div>
                
                {/* Climate Factors */}
                <div className="col-span-2">
                  <h3 className="font-medium text-lg text-agrigreen mb-3">Climate Factors</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rainfall (mm/month)</label>
                      <input
                        type="range"
                        name="rainfall"
                        min="0"
                        max="500"
                        value={formData.rainfall}
                        onChange={handleChange}
                        className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                      />
                      <div className="text-center text-sm mt-1">{formData.rainfall} mm</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                      <input
                        type="range"
                        name="temperature"
                        min="-10"
                        max="50"
                        value={formData.temperature}
                        onChange={handleChange}
                        className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                      />
                      <div className="text-center text-sm mt-1">{formData.temperature} °C</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
                      <input
                        type="range"
                        name="humidity"
                        min="0"
                        max="100"
                        value={formData.humidity}
                        onChange={handleChange}
                        className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                      />
                      <div className="text-center text-sm mt-1">{formData.humidity}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Soil Properties */}
                <div className="col-span-2">
                  <h3 className="font-medium text-lg text-agrigreen mb-3">Soil Properties</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH</label>
                      <input
                        type="range"
                        name="soilPH"
                        min="3"
                        max="10"
                        step="0.1"
                        value={formData.soilPH}
                        onChange={handleChange}
                        className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                      />
                      <div className="text-center text-sm mt-1">{formData.soilPH}</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nitrogen (kg/ha)</label>
                      <input
                        type="range"
                        name="soilNitrogen"
                        min="0"
                        max="100"
                        value={formData.soilNitrogen}
                        onChange={handleChange}
                        className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                      />
                      <div className="text-center text-sm mt-1">{formData.soilNitrogen}</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phosphorus (kg/ha)</label>
                      <input
                        type="range"
                        name="soilPhosphorus"
                        min="0"
                        max="100"
                        value={formData.soilPhosphorus}
                        onChange={handleChange}
                        className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                      />
                      <div className="text-center text-sm mt-1">{formData.soilPhosphorus}</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Potassium (kg/ha)</label>
                      <input
                        type="range"
                        name="soilPotassium"
                        min="0"
                        max="100"
                        value={formData.soilPotassium}
                        onChange={handleChange}
                        className="w-full h-2 bg-agrigreen-light/20 rounded-lg appearance-none cursor-pointer accent-agrigreen"
                      />
                      <div className="text-center text-sm mt-1">{formData.soilPotassium}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-agrigreen-light/10 text-agrigreen border border-agrigreen-light rounded-md hover:bg-agrigreen-light/20 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-agrigreen text-white rounded-md hover:bg-agrigreen-dark transition"
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Predict Best Crop'}
                </button>
              </div>
            </form>
            
            {/* Results Section */}
            {prediction && (
              <div className="mt-8 border-t border-agrigreen-light pt-6">
                <h2 className="text-2xl font-bold text-agrigreen mb-4">Crop Recommendation Results</h2>
                
                <div className="bg-agrigreen-light/10 p-4 rounded-lg border border-agrigreen-light mb-6">
                  <div className="text-center mb-4">
                    <span className="text-lg font-medium">Best Recommended Crop:</span>
                    <h3 className="text-3xl font-bold text-agrigreen">{prediction.bestCrop}</h3>
                    <div className="mt-1 text-agrigreen-dark">Confidence Score: {prediction.confidence}%</div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-agrigreen mb-2">Environmental Suitability</h4>
                      <p>{prediction.environmentalSuitability}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-agrigreen mb-2">Estimated Yield</h4>
                      <p>{prediction.estimatedYield}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-agrigreen mb-2">Recommendations</h4>
                    <p>{prediction.recommendations}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-agrigreen mb-3">Alternative Crops</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-agrigreen-light">
                      <thead className="bg-agrigreen-light/10">
                        <tr>
                          <th className="py-2 px-4 border-b text-left">Crop</th>
                          <th className="py-2 px-4 border-b text-left">Suitability Score</th>
                          <th className="py-2 px-4 border-b text-left">Water Requirement</th>
                          <th className="py-2 px-4 border-b text-left">Growth Period</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prediction.alternativeCrops.map((crop, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-agrigreen-light/5' : 'bg-white'}>
                            <td className="py-2 px-4 border-b">{crop.name}</td>
                            <td className="py-2 px-4 border-b">{crop.score}%</td>
                            <td className="py-2 px-4 border-b">{crop.waterRequirement}</td>
                            <td className="py-2 px-4 border-b">{crop.growthPeriod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-agrigreen text-sm">
          <p>© 2025 CropSmart Advisor | Helping farmers make data-driven decisions</p>
        </div>
      </div>
    </div>
  );
};

export default CropPrediction;