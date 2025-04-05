import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

// Define types
interface FormDataType {
  cropName: string;
  image: File | null;
  imagePreview: string | null;
}

interface DiseasePrediction {
  diseaseName: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  causes: string[];
  symptoms: string[];
  recommendations: string[];
}

const CropHealthMonitoring: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    cropName: '',
    image: null,
    imagePreview: null,
  });
  
  const [prediction, setPrediction] = useState<DiseasePrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    if (name === 'cropName') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const processFile = (file: File | null) => {
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setError(null);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: previewUrl
      }));
    }
  };
  
  const  handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.image) {
      setError('Please upload an image');
      return;
    }
    
    if (!formData.cropName.trim()) {
      setError('Please enter the crop name');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('image', formData.image);
      
      const response = await axios.post("http://localhost:5000/api/plant-disease-analysis", data, {
        headers: {
          'x-access-token': localStorage.getItem('userToken')
        }
      });
      
      if (response.data && response.data.analysis) {
        try {
          // Parse the text-based response
          const analysisText = response.data.analysis;
          
          // Extract disease name
          const diseaseNameMatch = analysisText.match(/\*\*Disease Name\*\*:\s*(.*?)(?=\n|\*\*)/);
          const diseaseName = diseaseNameMatch ? diseaseNameMatch[1].trim() : 'Unknown Disease';
          
          // Extract confidence
          const confidenceMatch = analysisText.match(/\*\*Confidence\*\*:\s*(.*?)(?=\n|\*\*)/);
          const confidenceText = confidenceMatch ? confidenceMatch[1].trim() : 'Low';
          // Convert text confidence to number
          let confidenceValue = 0;
          if (confidenceText.toLowerCase() === 'high') confidenceValue = 90;
          else if (confidenceText.toLowerCase() === 'medium' || confidenceText.toLowerCase() === 'moderate') confidenceValue = 70;
          else if (confidenceText.toLowerCase() === 'low') confidenceValue = 50;
          
          // Extract severity
          const severityMatch = analysisText.match(/\*\*Severity\*\*:\s*(.*?)(?=\n|\*\*)/);
          const severityText = severityMatch ? severityMatch[1].trim() : 'Medium';
          let severity: 'Low' | 'Medium' | 'High' = 'Medium';
          if (severityText.toLowerCase().includes('high')) severity = 'High';
          else if (severityText.toLowerCase().includes('low')) severity = 'Low';
          else severity = 'Medium';
          
          // Extract description
          const descriptionMatch = analysisText.match(/\*\*Description\*\*:\s*(.*?)(?=\n|\*\*)/);
          const description = descriptionMatch ? descriptionMatch[1].trim() : 'No description available';
          
          // Extract causes
          const causesMatch = analysisText.match(/\*\*Causes\*\*:\s*(.*?)(?=\n|\*\*)/);
          const causesText = causesMatch ? causesMatch[1].trim() : '';
          const causes = causesText.split(/,\s*/).filter(item => item.length > 0);
          
          // Extract symptoms
          const symptomsMatch = analysisText.match(/\*\*Symptoms\*\*:\s*(.*?)(?=\n|\*\*)/);
          const symptomsText = symptomsMatch ? symptomsMatch[1].trim() : '';
          const symptoms = symptomsText.split(/,\s*/).filter(item => item.length > 0);
          
          // Extract recommendations
          const recommendationsMatch = analysisText.match(/\*\*Recommendations\*\*:\s*(.*?)(?=\n|$)/s);
          const recommendationsText = recommendationsMatch ? recommendationsMatch[1].trim() : '';
          const recommendations = recommendationsText.split(/,\s*/).filter(item => item.length > 0);
          
          setPrediction({
            diseaseName,
            confidence: confidenceValue,
            severity,
            description,
            causes,
            symptoms,
            recommendations
          });
        } catch (parseError) {
          console.error('Error parsing analysis data:', parseError);
          setError('Failed to parse analysis data');
        }
      } else {
        setError('No analysis data received from server');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = (): void => {
    // Clean up the preview URL if it exists
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    
    setFormData({
      cropName: '',
      image: null,
      imagePreview: null,
    });
    setPrediction(null);
    setError(null);
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen bg-agriBg">
      {/* Sidebar */}
      <div className="w-16 m-3 h-[calc(100vh-2rem)] fixed">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-16 p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Plant Disease Detection Dashboard</h1>
            <p className="text-lg text-gray-600">Upload and analyze plant images for disease detection</p>
          </div>
          
          {/* Status Indicators */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Model Loaded</p>
                  <p className="text-gray-500 text-sm">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">API Connected</p>
                  <p className="text-gray-500 text-sm">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Processing Ready</p>
                  <p className="text-gray-500 text-sm">Operational</p>
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* File Upload Area */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              {/* Crop Name Input */}
              <div className="mb-6">
                <label htmlFor="cropName" className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Name
                </label>
                <input
                  type="text"
                  id="cropName"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  placeholder="Enter the crop name (e.g., Rice, Wheat, Corn)"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Image Upload */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onClick={handleSelectFileClick}
              >
                {formData.imagePreview ? (
                  <div className="text-center">
                    <img 
                      src={formData.imagePreview} 
                      alt="Uploaded plant" 
                      className="mx-auto max-h-64 max-w-full mb-4 rounded-md"
                    />
                    <p className="text-sm text-gray-500">{formData.image?.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Drag and drop your image here</h3>
                    <p className="text-gray-500 mb-4">or click to select a file</p>
                    <button 
                      type="button"
                      className="px-6 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Select File
                    </button>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              
              {error && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(formData.image || formData.cropName) && (
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                    disabled={loading || !formData.image || !formData.cropName}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Disease
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
          
          {/* Results Section */}
          {prediction && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-agrigreen mb-4">Disease Detection Results</h2>
              
              <div className="bg-agrigreen-light/10 p-4 rounded-lg border border-agrigreen-light mb-6">
                <div className="text-center mb-4">
                  <span className="text-lg font-medium">Detected Disease:</span>
                  <h3 className="text-3xl font-bold text-agrigreen">{prediction.diseaseName}</h3>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="text-agrigreen-dark">Confidence Score: {prediction.confidence}%</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" 
                      style={{
                        backgroundColor: 
                          prediction.severity === 'Low' ? 'rgba(34, 197, 94, 0.2)' : 
                          prediction.severity === 'Medium' ? 'rgba(234, 179, 8, 0.2)' : 
                          'rgba(239, 68, 68, 0.2)',
                        color: 
                          prediction.severity === 'Low' ? 'rgb(22, 163, 74)' : 
                          prediction.severity === 'Medium' ? 'rgb(202, 138, 4)' : 
                          'rgb(185, 28, 28)'
                      }}
                    >
                      {prediction.severity} Severity
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-agrigreen mb-2">Description</h4>
                  <p className="text-gray-700">{prediction.description}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xl font-medium text-agrigreen mb-3 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-agrigreen" />
                    Causes
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {prediction.causes.map((cause, index) => (
                      <li key={index}>{cause}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-agrigreen mb-3 flex items-center">
                    <XCircle className="mr-2 h-5 w-5 text-agrigreen" />
                    Symptoms
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {prediction.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-agrigreen mb-3 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-agrigreen" />
                  Recommendations
                </h3>
                <div className="bg-white border border-agrigreen-light rounded-lg overflow-hidden">
                  <ul className="divide-y divide-agrigreen-light">
                    {prediction.recommendations.map((recommendation, index) => (
                      <li key={index} className="p-4 flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-agrigreen-light/20 flex items-center justify-center text-agrigreen font-medium">
                          {index + 1}
                        </span>
                        <span className="ml-3 text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-8 text-center text-agrigreen text-sm">
            <p>© 2025 CropSmart Advisor | Helping farmers make data-driven decisions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropHealthMonitoring; 