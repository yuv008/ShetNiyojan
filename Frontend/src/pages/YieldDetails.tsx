import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  DollarSign, 
  CheckSquare, 
  Activity, 
  Mic, 
  PieChart as PieChartIcon, 
  ToggleLeft,
  Tractor,
  Sprout,
  Beaker,
  Bug,
  Droplets,
  Wheat,
  HelpCircle,
  ArrowLeft,
  TrendingDown,
  Lightbulb,
  Loader2
} from "lucide-react";
import ActivityForm from "@/components/yield/ActivityForm";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/common/DashboardHeader";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import LanguageSelector from "@/components/common/LanguageSelector";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface YieldDetailsProps {
  id?: string;
} 

// Define proper TypeScript interfaces
interface Fertilizer {
  name: string;
  quantity: string;
  billImage?: string | File | null;
}

interface Pesticide {
  name: string;
  quantity: string;
  billImage?: string | File | null;
}

interface Financial {
  category: string;
  paymentMethod: string;
  receiptImage?: string | File | null;
}

interface Activity {
  type: string;
  name: string;
  date: string;
  expense: number;
  summary?: string;
  isExpense?: boolean;
  fertilizer?: Fertilizer;
  pesticide?: Pesticide;
  financial?: Financial;
}

interface YieldDataType {
  name: string;
  type: string;
  status: string;
  createdDate: string;
  daysRemain: number;
  expense: number;
  activities: number;
  activityStatus: string;
  description: string;
  activityList: Activity[];
}

// Define activity types
const ActivityTypes = [
  "Cultivation",
  "Sowing",
  "Fertilizer",
  "Pesticide",
  "Irrigation",
  "Harvesting",
  "Financial",
  "Other"
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "Cultivation":
      return <Tractor className="h-4 w-4 text-orange-600" />;
    case "Sowing":
      return <Sprout className="h-4 w-4 text-green-600" />;
    case "Fertilizer":
      return <Beaker className="h-4 w-4 text-purple-600" />;
    case "Pesticide":
      return <Bug className="h-4 w-4 text-red-600" />;
    case "Irrigation":
      return <Droplets className="h-4 w-4 text-blue-600" />;
    case "Harvesting":
      return <Wheat className="h-4 w-4 text-yellow-600" />;
    default:
      return <HelpCircle className="h-4 w-4 text-gray-600" />;
  }
};

// TypeScript declaration for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

const YieldDetails = () => {
  // Get yieldId from URL - with wildcard route, we need to parse it from the pathname
  const { id } = useParams(); // This might be undefined with wildcard route
  const location = useLocation();
  const yieldId = id || location.pathname.split('/yield/')[1]; // Extract from path if useParams doesn't work

  const { toast } = useToast();
  const { user } = useAuth();
  
  const [showActivityForm, setShowActivityForm] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Active");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [processingVoice, setProcessingVoice] = useState<boolean>(false);
  const [formDataFromSpeech, setFormDataFromSpeech] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFinancialView, setShowFinancialView] = useState<boolean>(false);
  
  const recognitionRef = useRef<any>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data - in real app, fetch from API
  const [yieldData, setYieldData] = useState<YieldDataType>({
    name: "Gopal",
    type: "Financial Planning",
    status: "Active",
    createdDate: "4/4/2025",
    daysRemain: 12,
    expense: 102,
    activities: 3,
    activityStatus: "Active",
    description: "Active cultivation",
    activityList: [
      {
        type: "Cultivation",
        name: "Rotavating Farm for Wheat",
        date: "4/4/2025, 3:10:08 PM",
        expense: 500,
      },
      {
        type: "Sowing",
        name: "Gopal Vijay Dose",
        date: "4/4/2025, 3:10:20 PM",
        expense: 300,
      },
      {
        type: "Fertilizer",
        name: "NPK Application",
        date: "4/4/2025, 3:10:32 PM",
        expense: 800,
        fertilizer: {
          name: "NPK 20-20-20",
          quantity: "50kg",
          billImage: "receipt1.jpg"
        }
      }
    ]
  });

  // Add these state variables after other state declarations
  const [aiSuggestions, setAiSuggestions] = useState<{title: string; description: string; category: string}[]>([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState<boolean>(false);
  const [aiSuggestionsError, setAiSuggestionsError] = useState<string | null>(null);

  // Fetch yield data and activities when component mounts
  useEffect(() => {
    if (yieldId) {
      console.log("Fetching data for yield ID:", yieldId);
      fetchYieldData();
    } else {
      console.error("Yield ID not found in URL");
      toast({
        title: "Error",
        description: "Could not determine which yield to display.",
        variant: "destructive",
      });
    }
  }, [yieldId]);

  const fetchYieldData = async () => {
    try {
      setLoading(true);
      
      // Get user's mobile number for API requests
      const mobileNo = getUserMobileNumber();
      
      if (!mobileNo) {
        toast({
          title: "Error",
          description: "User mobile number not found. Please log in again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      console.log(`Fetching data for yield ID: ${yieldId} and mobile: ${mobileNo}`);
      
      // 1. Fetch the yield details
      const yieldResponse = await axios.get(`http://localhost:5000/api/yields/${yieldId}`, {
        headers: {
          "x-access-token": localStorage.getItem("userToken")
        }
      });
      
      if (!yieldResponse.data) {
        throw new Error("No yield data received from the server");
      }
      
      console.log("Yield details response:", yieldResponse.data);
      
      // Extract status from the backend response
      const yieldStatus = yieldResponse.data.status || "Active";
      console.log("Yield status from backend:", yieldStatus);
      
      // 2. Fetch the activities for this yield
      const activitiesResponse = await axios.post("http://localhost:5000/api/activities", {
        yield_id: yieldId,
        mobileno: mobileNo
      }, {
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("userToken")
        }
      });
      
      console.log("Activities response:", activitiesResponse.data);
      
      // Map the backend data to our component's expected format
      const mappedYieldData: YieldDataType = {
        name: yieldResponse.data.name || `Yield ${yieldId}`,
        type: yieldResponse.data.type || "Crop",
        status: yieldStatus, // Explicitly use the status from backend
        createdDate: yieldResponse.data.createdAt || new Date().toLocaleDateString(),
        daysRemain: yieldResponse.data.daysRemain || 0,
        expense: yieldResponse.data.expense || 0,
        activities: activitiesResponse.data?.activities?.length || 0,
        activityStatus: yieldStatus, // Also use the same status for activityStatus
        description: yieldResponse.data.description || "No description available",
        activityList: []
      };
      
      // Map the activities from the backend to our component's expected format
      if (activitiesResponse.data?.activities && Array.isArray(activitiesResponse.data.activities)) {
        console.log("Raw activities from backend:", activitiesResponse.data.activities);
        
        mappedYieldData.activityList = activitiesResponse.data.activities.map((activity: any) => {
          console.log("Processing activity:", activity);
          
          // The activity type could be in different properties depending on the backend implementation
          const rawActivityType = activity.activity_type || activity.type || "";
          console.log("Raw activity type:", rawActivityType);
          
          // Determine the activity type - normalize to handle case differences
          let activityType = "Other";
          
          // First check exact matches (case-insensitive)
          const lowerRawType = rawActivityType.toLowerCase();
          if (lowerRawType === "fertilizer" || lowerRawType === "pesticide" || 
              lowerRawType === "financial" || lowerRawType === "cultivation" ||
              lowerRawType === "sowing" || lowerRawType === "irrigation" || 
              lowerRawType === "harvesting") {
            // Capitalize first letter
            activityType = lowerRawType.charAt(0).toUpperCase() + lowerRawType.slice(1);
          } 
          // If it's "general", try to infer a more specific type based on activity name
          else if (lowerRawType === "general" || lowerRawType === "other") {
            const activityNameLower = (activity.activity_name || activity.name || "").toLowerCase();
            
            if (activityNameLower.includes("plow") || activityNameLower.includes("till") || 
                activityNameLower.includes("cultivat") || activityNameLower.includes("prepare")) {
              activityType = "Cultivation";
            } else if (activityNameLower.includes("plant") || activityNameLower.includes("seed") || 
                       activityNameLower.includes("sow")) {
              activityType = "Sowing";
            } else if (activityNameLower.includes("water") || activityNameLower.includes("irrigat")) {
              activityType = "Irrigation";
            } else if (activityNameLower.includes("harvest") || activityNameLower.includes("collect") || 
                       activityNameLower.includes("pick")) {
              activityType = "Harvesting";
            }
            // Keep as "Other" if no specific type could be determined
          }
          
          console.log("Mapped activity type:", activityType);
          
          // Base activity object
          const mappedActivity: Activity = {
            type: activityType,
            name: activity.activity_name || activity.name || "Unnamed Activity",
            date: activity.created_at || activity.date || new Date().toLocaleString(),
            expense: activity.amount || activity.expense || 0,
            summary: activity.summary || ""
          };
          
          // Add specific fields based on activity type
          if (activity.activity_type === "fertilizer") {
            mappedActivity.fertilizer = {
              name: activity.fertilizer_name || "",
              quantity: activity.quantity || "",
              billImage: activity.bill_image || null
            };
          } else if (activity.activity_type === "pesticide") {
            mappedActivity.pesticide = {
              name: activity.pesticide_name || "",
              quantity: activity.quantity || "",
              billImage: activity.bill_image || null
            };
          } else if (activity.activity_type === "financial") {
            mappedActivity.financial = {
              category: activity.financial_category || "",
              paymentMethod: activity.payment_method || "",
              receiptImage: activity.receipt || null
            };
          }
          
          return mappedActivity;
        });
        
        // Calculate total expense
        mappedYieldData.expense = mappedYieldData.activityList.reduce((sum, activity) => {
          return sum + (activity.expense || 0);
        }, 0);
      }
      
      // Update the state with the fetched data
      setYieldData(mappedYieldData);
      
      // Update the status state
      setStatus(yieldStatus);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching yield data:", error);
      toast({
        title: "Error",
        description: "Failed to load yield data. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      
      // Keep the mock data as fallback in case of error
      setYieldData(prev => ({
        ...prev,
        name: `Yield ${yieldId} (Mock Data)`
      }));
    }
  };

  // Fetch user's mobile number from local storage or auth context
  const getUserMobileNumber = (): string => {
    // Check if we have it in localStorage
    const storedMobileNo = localStorage.getItem('userMobileNo');
    
    // If not in local storage, you might get it from the user object
    const userMobileNo = user?.mobileno || storedMobileNo || '';
    
    return userMobileNo;
  };

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the appropriate constructor
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure the recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Set to Indian English
      
      // Set up event handlers
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update the state with the transcription
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          console.log(`Error: ${event.error}. Please try again.`);
          setRecording(false);
          setCountdown(0);
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
        }
      };
      
      recognitionRef.current.onend = () => {
        // This will be called when the 5-second timer stops the recording
        console.log('Speech recognition ended');
      };
    } else {
      console.error('Speech recognition not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
        }
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Process the transcribed text to identify activity details
  const processTranscript = async (text: string) => {
    console.log("Processing transcript:", text);
    
    // Skip processing if no text was captured
    if (!text || text.trim() === '') {
      setProcessingVoice(false);
      setRecording(false);
      return;
    }
    
    setProcessingVoice(true);
    
    try {
      // Call Gemini API to format the speech data
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY.replace(/"/g, '');
      console.log("Using API key (first few chars):", apiKey.substring(0, 5) + "...");
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following voice input for an agricultural activity and extract structured data in JSON format:
                  
                  Voice input: "${text}"
                  
                  Extract the following fields:
                  - activity_type: One of [fertilizer, pesticide, financial, cultivation, sowing, irrigation, harvesting, other]
                  - activity_name: A short descriptive name for the activity
                  - summary: Brief summary of what was done
                  - amount: Numerical amount spent (in INR)
                  
                  For fertilizer activities, also extract:
                  - fertilizer_name: Name of the fertilizer used
                  - quantity: Amount used with unit (e.g., "5 kg")
                  
                  For pesticide activities, also extract:
                  - pesticide_name: Name of the pesticide used
                  - quantity: Amount used with unit (e.g., "2 liters")
                  
                  For financial activities, also extract:
                  - financial_category: Category of expense (e.g., labor, equipment, seeds)
                  - payment_method: Method of payment (e.g., cash, card, UPI)
                  
                  Return ONLY valid JSON with no explanation text.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error response:", {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Error connecting to Gemini API: ${response.statusText} (${response.status})`);
      }
      
      const data = await response.json();
      console.log("Gemini Response:", data);
      
      let formattedData;
      try {
        // Extract the JSON from Gemini's response
        const jsonContent = data.candidates[0].content.parts[0].text;
        
        // Clean the JSON content by removing any markdown formatting
        const cleanedJsonContent = jsonContent
          .replace(/```json\n?/g, '') // Remove opening ```json markers
          .replace(/```\n?/g, '')     // Remove closing ``` markers
          .trim();                     // Trim any extra whitespace
          
        console.log("Cleaned JSON content:", cleanedJsonContent);
        
        // Parse the cleaned JSON
        formattedData = JSON.parse(cleanedJsonContent);
        console.log("Formatted data:", formattedData);
      } catch (jsonError) {
        console.error("Error parsing Gemini response:", jsonError);
        toast({
          title: "Error",
          description: "Failed to parse voice input. Please try again or enter manually.",
          variant: "destructive"
        });
        setProcessingVoice(false);
        setRecording(false);
        return;
      }
      
      // Map the Gemini formatted data to our form structure
    const formData = {
        type: formattedData.activity_type ? 
              formattedData.activity_type.charAt(0).toUpperCase() + formattedData.activity_type.slice(1) : '',
        name: formattedData.activity_name || '',
        expense: formattedData.amount ? formattedData.amount.toString() : '0',
        summary: formattedData.summary || text, // Fallback to original transcript if no summary
      isExpense: true,
      fertilizer: {
          name: formattedData.fertilizer_name || '',
          quantity: formattedData.quantity || '',
        billImage: null
      },
      pesticide: {
          name: formattedData.pesticide_name || '',
          quantity: formattedData.quantity || '',
        billImage: null
      },
      financial: {
          category: formattedData.financial_category || '',
          paymentMethod: formattedData.payment_method || '',
        receiptImage: null
      }
    };
    
    // Set the form data and show the form
    setFormDataFromSpeech(formData);
    setShowActivityForm(true);
    
    } catch (error) {
      console.error("Error processing voice input with Gemini:", error);
      toast({
        title: "Error",
        description: "Failed to process voice input. Please try again or enter manually.",
        variant: "destructive"
      });
    } finally {
    // Reset recording states
    setTranscript("");
    setProcessingVoice(false);
    setRecording(false);
    }
  };

  const handleAddActivity = async (data: any) => {
    if (!yieldId) {
      toast({
        title: "Error",
        description: "Yield ID is missing. Cannot add activity.",
        variant: "destructive",
      });
      return;
    }

    try {
    // Format the date and ensure values are correct types
    const formattedData = {
      ...data,
      expense: parseFloat(data.expense) || 0,
      date: new Date().toLocaleString()
    };
    
      // Get mobile number for the API request
      const mobileNo = getUserMobileNumber();
      
      // Map UI activity type to lowercase for backend compatibility
      // Backend expects: fertilizer, pesticide, financial, cultivation, sowing, irrigation, harvesting, other
      let activityType = formattedData.type.toLowerCase();
      
      // Calculate the expense value correctly
      const expenseValue = formattedData.isExpense ? formattedData.expense : -formattedData.expense;
      
      // Create the base API request payload with required fields
      const apiPayload: any = {
        yield_id: yieldId,
        mobileno: mobileNo,
        activity_type: activityType, // Use lowercase activity type for backend
        activity_name: formattedData.name,
        summary: formattedData.summary || "",
        amount: expenseValue
      };
      
      // Add type-specific fields
      if (activityType === "fertilizer" && formattedData.fertilizer) {
        apiPayload.fertilizer_name = formattedData.fertilizer.name || "";
        apiPayload.quantity = formattedData.fertilizer.quantity || "";
        apiPayload.bill_image = formattedData.fertilizer.billImage || "";
      } else if (activityType === "pesticide" && formattedData.pesticide) {
        apiPayload.pesticide_name = formattedData.pesticide.name || "";
        apiPayload.quantity = formattedData.pesticide.quantity || "";
        apiPayload.bill_image = formattedData.pesticide.billImage || "";
      } else if (activityType === "financial" && formattedData.financial) {
        apiPayload.financial_category = formattedData.financial.category || "";
        apiPayload.payment_method = formattedData.financial.paymentMethod || "";
        apiPayload.receipt = formattedData.financial.receiptImage || "";
      }
      
      console.log("Sending activity to API:", apiPayload);
      
      // Make the API call to add the activity
      const response = await axios.post("http://localhost:5000/api/create_activity", apiPayload, {
        headers: {
          "Content-Type": "application/json",
          "x-access-token": localStorage.getItem("userToken")
        }
      });
      
      if (response.data) {
        console.log("Activity added successfully:", response.data);
        
        // Create a clean activity object with just the needed properties for UI
    const newActivity: Activity = {
      type: formattedData.type,
      name: formattedData.name,
      expense: expenseValue,
      date: formattedData.date,
      summary: formattedData.summary
    };
    
    // Add specific properties based on activity type
    if (formattedData.type === "Fertilizer" && formattedData.fertilizer) {
      newActivity.fertilizer = formattedData.fertilizer;
    } else if (formattedData.type === "Pesticide" && formattedData.pesticide) {
      newActivity.pesticide = formattedData.pesticide;
    } else if (formattedData.type === "Financial" && formattedData.financial) {
      newActivity.financial = formattedData.financial;
    }
    
        // Update the yield data in the UI
    setYieldData(prevData => {
      const updatedActivities = [...prevData.activityList, newActivity];
      // Calculate total expense (positive for expenses, negative for income)
      const totalExpense = updatedActivities.reduce((sum, act) => {
        return sum + (act.expense || 0);
      }, 0);
      
      return {
        ...prevData,
        activityList: updatedActivities,
        activities: updatedActivities.length,
        expense: totalExpense
      };
    });
    
        toast({
          title: "Success",
          description: "Activity added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding activity:", error);
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset form state
    setShowActivityForm(false);
    setFormDataFromSpeech(null);
    }
  };

  const startRecording = () => {
    // Reset states
    setTranscript("");
    setProcessingVoice(false);
    setRecording(true);
    setCountdown(5);
    
    // Start countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Clear the interval when we reach 0
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          
          // Stop the recording and process
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
              setProcessingVoice(true);
              
              // Short delay to ensure all speech has been processed
              setTimeout(() => {
                processTranscript(transcript);
              }, 500);
            } catch (error) {
              console.error("Error stopping speech recognition:", error);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start the speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("Started recording for 5 seconds...");
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setRecording(false);
        setCountdown(0);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      }
    }
  };

  const toggleStatus = async () => {
    const newStatus = status === "Active" ? "Inactive" : "Active";
    
    try {
      // Show loading toast
      toast({
        title: "Updating status...",
        description: "Please wait while we update the yield status."
      });
      
      // Make API call to update the yield status
      const response = await axios.put(
        `http://localhost:5000/api/yields/${yieldId}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("userToken")
          }
        }
      );
      
      if (response.data && response.data.status === "success") {
        // Refresh yield data from the backend instead of just updating local state
        await fetchYieldData();
        
        // Show success toast
        toast({
          title: "Status Updated",
          description: `Yield successfully marked as ${newStatus}`,
          variant: "default"
        });
        
        console.log(`Yield ${yieldId} marked as ${newStatus} in database`);
      } else {
        throw new Error("Failed to update yield status");
      }
    } catch (error) {
      console.error("Error updating yield status:", error);
      
      // Show error toast
      toast({
        title: "Update Failed",
        description: "Failed to update yield status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getExpenseData = (): ExpenseCategory[] => {
    if (!yieldData || !yieldData.activityList || yieldData.activityList.length === 0) {
      return [];
    }
    
    // Group expenses by activity type
    const expensesByCategory: Record<string, number> = {};
    
    yieldData.activityList.forEach(activity => {
      if (activity.expense && activity.expense > 0) {
        // Use activity type as the category
        const category = activity.type || 'Other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + activity.expense;
      }
    });
    
    // Define colors for each category
    const categoryColors: Record<string, string> = {
      'Cultivation': '#FF8C00', // Orange
      'Sowing': '#4CAF50',      // Green
      'Fertilizer': '#9C27B0',  // Purple
      'Pesticide': '#F44336',   // Red
      'Irrigation': '#2196F3',  // Blue
      'Harvesting': '#FFC107',  // Yellow
      'Financial': '#009688',   // Teal
      'Other': '#607D8B'        // Gray
    };
    
    // Convert to array format for the chart
    return Object.keys(expensesByCategory).map(category => ({
      name: category,
      value: expensesByCategory[category],
      color: categoryColors[category] || '#607D8B' // Default to gray if no color defined
    }));
  };

  const toggleFinancialView = () => {
    setShowFinancialView(!showFinancialView);
  };

  // Replace the fetchAISuggestions function with additional logging
  const fetchAISuggestions = async () => {
    // Skip if already loading or if we already have suggestions
    if (loadingAiSuggestions || aiSuggestions.length > 0) return;
    
    console.log("Starting fetchAISuggestions...");
    setLoadingAiSuggestions(true);
    setAiSuggestionsError(null);
    
    try {
      // Prepare the expense data for the API
      const expenseData = getExpenseData().map(category => ({
        name: category.name,
        value: category.value,
        percentage: Math.round((category.value / yieldData.expense) * 100)
      }));
      
      console.log("Expense data prepared:", expenseData);
      console.log("Total expense:", yieldData.expense);
      
      const requestData = {
        expenseData,
        yieldName: yieldData.name,
        totalExpense: yieldData.expense
      };
      
      console.log("Sending request with data:", requestData);
      console.log("User token:", localStorage.getItem("userToken"));
      
      // Call the backend API
      const response = await axios.post(
        "http://localhost:5000/api/cost-reduction-suggestions", 
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-access-token": localStorage.getItem("userToken")
          }
        }
      );
      
      console.log("Received response:", response.data);
      
      // Check if the response was successful
      if (response.data.status === "success" && response.data.data && response.data.data.suggestions) {
        console.log("Setting suggestions:", response.data.data.suggestions);
        setAiSuggestions(response.data.data.suggestions);
      } else {
        console.error("Unexpected API response format:", response.data);
        setAiSuggestionsError("Received invalid response from server");
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        setAiSuggestionsError(`Failed to fetch suggestions: ${error.response?.status} ${error.response?.statusText}`);
      } else {
        setAiSuggestionsError("Failed to fetch cost reduction suggestions");
      }
    } finally {
      console.log("Finished fetchAISuggestions");
      setLoadingAiSuggestions(false);
    }
  };

  // Add this useEffect to fetch suggestions when the financial view is shown
  useEffect(() => {
    if (showFinancialView && getExpenseData().length > 0 && aiSuggestions.length === 0) {
      fetchAISuggestions();
    }
  }, [showFinancialView]);

  // Re-add the getCostSavingSuggestions function that was removed
  const getCostSavingSuggestions = () => {
    const expenseData = getExpenseData();
    const suggestions: { title: string; description: string; icon: JSX.Element }[] = [];
    
    // Sort expenses by value (highest first)
    const sortedExpenses = [...expenseData].sort((a, b) => b.value - a.value);
    
    // Get the highest expense category
    if (sortedExpenses.length > 0) {
      const highestExpense = sortedExpenses[0];
      
      // Generate specific suggestions based on the category
      if (highestExpense.name === 'Fertilizer') {
        suggestions.push({
          title: 'Optimize Fertilizer Usage',
          description: 'Consider soil testing to determine exact nutrient needs. Using targeted fertilizer application can reduce costs by 15-30%.',
          icon: <Beaker className="h-5 w-5 text-purple-600" />
        });
        suggestions.push({
          title: 'Try Organic Alternatives',
          description: 'Compost and manure can reduce chemical fertilizer costs. Consider crop rotation with nitrogen-fixing plants.',
          icon: <Sprout className="h-5 w-5 text-green-600" />
        });
      } else if (highestExpense.name === 'Pesticide') {
        suggestions.push({
          title: 'Implement IPM Strategies',
          description: 'Integrated Pest Management can reduce pesticide use by combining biological controls with targeted applications.',
          icon: <Bug className="h-5 w-5 text-red-600" />
        });
        suggestions.push({
          title: 'Use Pest-Resistant Varieties',
          description: 'Planting resistant crop varieties can reduce pesticide expenses by up to 25%.',
          icon: <Leaf className="h-5 w-5 text-green-600" />
        });
      } else if (highestExpense.name === 'Irrigation') {
        suggestions.push({
          title: 'Upgrade Irrigation System',
          description: 'Drip irrigation can reduce water usage by 30-50% compared to traditional methods, saving on water costs.',
          icon: <Droplets className="h-5 w-5 text-blue-600" />
        });
        suggestions.push({
          title: 'Implement Irrigation Scheduling',
          description: 'Using soil moisture sensors and weather data can optimize irrigation timing and reduce waste.',
          icon: <Activity className="h-5 w-5 text-blue-600" />
        });
      } else if (highestExpense.name === 'Cultivation') {
        suggestions.push({
          title: 'Consider No-Till Farming',
          description: 'Reducing tillage can save on fuel, labor, and equipment costs while improving soil health.',
          icon: <Tractor className="h-5 w-5 text-orange-600" />
        });
        suggestions.push({
          title: 'Share Equipment',
          description: 'Partner with neighboring farmers to share expensive equipment and reduce individual costs.',
          icon: <DollarSign className="h-5 w-5 text-green-600" />
        });
      }
    }
    
    // Add general suggestions that apply to any farm
    suggestions.push({
      title: 'Bulk Purchasing',
      description: 'Buy inputs in bulk or through farmer cooperatives to get better prices on seeds, fertilizers, and other supplies.',
      icon: <DollarSign className="h-5 w-5 text-green-600" />
    });
    
    suggestions.push({
      title: 'Track and Analyze Expenses',
      description: 'Continue monitoring expenses closely to identify trends and opportunities for cost reduction.',
      icon: <PieChartIcon className="h-5 w-5 text-blue-600" />
    });
    
    return suggestions;
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
          <div className="col-span-1">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-11">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agrigreen"></div>
              </div>
            ) : (
              <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">{yieldData.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {yieldData.type}
                  </span>
                  <span className={`${status === "Active" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"} px-3 py-1 rounded-full text-sm flex items-center gap-1`}>
                    {status === "Active" ? 
                      <CheckSquare className="h-4 w-4" /> : 
                      <ToggleLeft className="h-4 w-4" />
                    }
                    {status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={toggleStatus} 
                  className="flex items-center gap-1"
                >
                  <ToggleLeft className="h-5 w-5" />
                  Mark {status === "Active" ? "Inactive" : "Active"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={toggleFinancialView}
                  className="flex items-center gap-1"
                >
                  {showFinancialView ? (
                    <>
                      <ArrowLeft className="h-5 w-5" />
                      Back to Activities
                    </>
                  ) : (
                    <>
                      <PieChartIcon className="h-5 w-5" />
                  Financial Analytics
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{yieldData.daysRemain}</h3>
                    <p className="text-sm text-gray-600">{yieldData.description}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">₹{yieldData.expense}</h3>
                    <p className="text-sm text-gray-600">This Yield</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{yieldData.activities}</h3>
                    <p className="text-sm text-gray-600">Activities</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`${status === "Active" ? "bg-orange-100" : "bg-red-100"} p-2 rounded-full`}>
                    <Activity className={`h-5 w-5 ${status === "Active" ? "text-orange-600" : "text-red-600"}`} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${status === "Active" ? "" : "text-red-600"}`}>{status}</h3>
                    <p className="text-sm text-gray-600">Yield Status</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Speech Recognition Status Display */}
            {recording && (
              <Card className="p-4 mb-4 border-2 border-blue-400">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Mic className="h-5 w-5 text-red-600 mr-2 animate-pulse" />
                    {processingVoice ? "Processing..." : `Recording... ${countdown}s`}
                  </h3>
                  {transcript && (
                    <p className="mt-2 text-gray-700">{transcript}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Toggle between Financial View and Regular View */}
            {showFinancialView ? (
              // Financial Analytics View
              <div>
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Expense Breakdown by Category</h2>
                  
                  {getExpenseData().length > 0 ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getExpenseData()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getExpenseData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`₹${value}`, 'Amount']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No expense data available to display</p>
                    </div>
                  )}
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Total Expenses:</span>
                          <span className="font-bold">₹{yieldData.expense}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Number of Activities:</span>
                          <span>{yieldData.activities}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Expense Details</h4>
                      {getExpenseData().map((category, index) => (
                        <div key={index} className="flex justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                            <span>{category.name}:</span>
                          </div>
                          <span>₹{category.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                
                {/* Cost-saving Suggestions */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold">AI Cost Reduction Suggestions</h2>
                  </div>
                  
                  {loadingAiSuggestions ? (
                    <div className="flex justify-center items-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-agrigreen" />
                        <p className="text-sm text-gray-500">Generating smart suggestions...</p>
                      </div>
                    </div>
                  ) : aiSuggestionsError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600">{aiSuggestionsError}</p>
                      <Button 
                        variant="outline" 
                        className="mt-2" 
                        onClick={fetchAISuggestions}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : aiSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiSuggestions.map((suggestion, index) => (
                        <Card key={index} className="p-4 border border-gray-200">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-gray-100 p-2 rounded-full">
                                {suggestion.category === "General" ? (
                                  <DollarSign className="h-5 w-5 text-green-600" />
                                ) : suggestion.category === "Fertilizer" ? (
                                  <Beaker className="h-5 w-5 text-purple-600" />
                                ) : suggestion.category === "Pesticide" ? (
                                  <Bug className="h-5 w-5 text-red-600" />
                                ) : suggestion.category === "Irrigation" ? (
                                  <Droplets className="h-5 w-5 text-blue-600" />
                                ) : suggestion.category === "Cultivation" ? (
                                  <Tractor className="h-5 w-5 text-orange-600" />
                                ) : suggestion.category === "Sowing" ? (
                                  <Sprout className="h-5 w-5 text-green-600" />
                                ) : suggestion.category === "Harvesting" ? (
                                  <Wheat className="h-5 w-5 text-yellow-600" />
                                ) : (
                                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-lg flex items-center gap-2">
                                {suggestion.title}
                                {suggestion.category && suggestion.category !== "General" && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                    {suggestion.category}
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getCostSavingSuggestions().map((suggestion, index) => (
                        <Card key={index} className="p-4 border border-gray-200">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="bg-gray-100 p-2 rounded-full">
                                {suggestion.icon}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-lg flex items-center gap-2">
                                {suggestion.title}
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <div className="col-span-full mt-2">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2" 
                          onClick={fetchAISuggestions}
                        >
                          <Lightbulb className="h-4 w-4" />
                          Get AI-Powered Cost Reduction Suggestions
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              // Regular Activities View
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Activities</h2>
                {status === "Active" ? (
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setFormDataFromSpeech(null);
                      setShowActivityForm(true);
                    }} 
                    className="flex items-center gap-1"
                  >
                    <span>+</span> Add New Entry
                  </Button>
                  <Button 
                    onClick={startRecording}
                    disabled={recording || showActivityForm}
                    className="flex items-center gap-1"
                  >
                    <Mic className="h-5 w-5" />
                    Voice Input
                  </Button>
                </div>
                ) : (
                  <div>
                    <span className="text-amber-600 flex items-center gap-1">
                      <ToggleLeft className="h-5 w-5" />
                      This yield is inactive. No new activities can be added.
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {yieldData.activityList.map((activity, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-gray-100 p-1.5 rounded">
                            {getActivityIcon(activity.type)}
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            activity.type === "Cultivation" ? "bg-orange-100 text-orange-800" :
                            activity.type === "Sowing" ? "bg-green-100 text-green-800" :
                            activity.type === "Fertilizer" ? "bg-purple-100 text-purple-800" :
                            activity.type === "Pesticide" ? "bg-red-100 text-red-800" :
                            activity.type === "Irrigation" ? "bg-blue-100 text-blue-800" :
                            activity.type === "Harvesting" ? "bg-yellow-100 text-yellow-800" :
                            activity.type === "Financial" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {activity.type}
                          </span>
                          <span className="text-gray-500 text-sm">{activity.date}</span>
                        </div>
                        <h3 className="font-medium">{activity.name}</h3>
                        {activity.summary && (
                          <p className="text-sm text-gray-600 mt-1">{activity.summary}</p>
                        )}
                        {activity.type === "Fertilizer" && activity.fertilizer && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Fertilizer: {activity.fertilizer.name}</p>
                            <p>Quantity: {activity.fertilizer.quantity}</p>
                            {activity.fertilizer.billImage && (
                              <div className="mt-2">
                                <a href="#" className="text-blue-600 hover:underline">
                                  View Bill Image
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        {activity.type === "Pesticide" && activity.pesticide && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Pesticide: {activity.pesticide.name}</p>
                            <p>Quantity: {activity.pesticide.quantity}</p>
                            {activity.pesticide.billImage && (
                              <div className="mt-2">
                                <a href="#" className="text-blue-600 hover:underline">
                                  View Bill Image
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        {activity.type === "Financial" && activity.financial && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Category: {activity.financial.category}</p>
                            <p>Payment Method: {activity.financial.paymentMethod}</p>
                            {activity.financial.receiptImage && (
                              <div className="mt-2">
                                <a href="#" className="text-blue-600 hover:underline">
                                  View Receipt
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold">₹{activity.expense}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
            )}

            {showActivityForm && (
              <ActivityForm
                onClose={() => {
                  setShowActivityForm(false);
                  setFormDataFromSpeech(null);
                }}
                onSubmit={handleAddActivity}
                audioData={formDataFromSpeech}
              />
            )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating language selector */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <LanguageSelector />
        </div>
      </div>
    </div>
  );
};

export default YieldDetails;