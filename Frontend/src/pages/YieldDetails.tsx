import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  DollarSign, 
  CheckSquare, 
  Activity, 
  Mic, 
  PieChart, 
  ToggleLeft,
  Tractor,
  Sprout,
  Beaker,
  Bug,
  Droplets,
  Wheat,
  HelpCircle
} from "lucide-react";
import ActivityForm from "@/components/yield/ActivityForm";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/common/DashboardHeader";

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

const YieldDetails = ({ id }: YieldDetailsProps) => {
  const [showActivityForm, setShowActivityForm] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("Active");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [processingVoice, setProcessingVoice] = useState<boolean>(false);
  const [formDataFromSpeech, setFormDataFromSpeech] = useState<any>(null);
  
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
  const processTranscript = (text: string) => {
    console.log("Processing transcript:", text);
    
    // Skip processing if no text was captured
    if (!text || text.trim() === '') {
      setProcessingVoice(false);
      setRecording(false);
      return;
    }
    
    // Convert text to lowercase for easier matching
    const lowerText = text.toLowerCase();
    
    // Create a template for recognized activity
    let newActivity = {
      type: "",
      name: "",
      expense: 0,
      summary: text,
      date: new Date().toLocaleString(),
      details: {
        fertilizer: {
          name: "",
          quantity: ""
        },
        pesticide: {
          name: "",
          quantity: ""
        },
        financial: {
          category: "",
          paymentMethod: ""
        }
      }
    };
    
    // Try to identify activity type
    for (const type of ActivityTypes) {
      if (lowerText.includes(type.toLowerCase())) {
        newActivity.type = type;
        break;
      }
    }
    
    // If no type was explicitly mentioned, try to infer from common activities
    if (!newActivity.type) {
      if (lowerText.includes('plow') || lowerText.includes('till') || lowerText.includes('prepare')) {
        newActivity.type = 'Cultivation';
      } else if (lowerText.includes('plant') || lowerText.includes('seed') || lowerText.includes('sow')) {
        newActivity.type = 'Sowing';
      } else if (lowerText.includes('fertiliz') || lowerText.includes('nutrient') || lowerText.includes('npk')) {
        newActivity.type = 'Fertilizer';
      } else if (lowerText.includes('pest') || lowerText.includes('insect') || lowerText.includes('spray')) {
        newActivity.type = 'Pesticide';
      } else if (lowerText.includes('water') || lowerText.includes('irrigat')) {
        newActivity.type = 'Irrigation';
      } else if (lowerText.includes('harvest') || lowerText.includes('collect') || lowerText.includes('pick')) {
        newActivity.type = 'Harvesting';
      } else if (lowerText.includes('loan') || lowerText.includes('insur') || lowerText.includes('invest') || lowerText.includes('subsid') || lowerText.includes('money') || lowerText.includes('payment')) {
        newActivity.type = 'Financial';
      } else {
        // Default if we can't determine
        newActivity.type = 'Other';
      }
    }
    
    // Extract the name (using the first sentence or part of text as activity name)
    const nameParts = text.split(/[.,;:]/).filter(part => part.trim().length > 0);
    if (nameParts.length > 0) {
      // Capitalize first letter of each word
      newActivity.name = nameParts[0].trim().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } else {
      newActivity.name = `New ${newActivity.type} Activity`;
    }
    
    // Try to extract expense amount
    const expenseMatch = lowerText.match(/(?:spent|cost|expense|rupees|rs\.?|₹)\s*(?:of|is|was|:)?\s*(\d+(?:\.\d+)?)/i);
    if (expenseMatch) {
      newActivity.expense = parseFloat(expenseMatch[1]);
    } else {
      // Look for any number that might represent an expense
      const numberMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:rupees|rs\.?|₹)/i);
      if (numberMatch) {
        newActivity.expense = parseFloat(numberMatch[1]);
      } else {
        // Default value if no expense detected - set to 0
        newActivity.expense = 0;
      }
    }
    
    // For specific activity types, extract additional details
    if (newActivity.type === 'Fertilizer') {
      // Try to extract fertilizer name and quantity
      const fertilizerMatch = lowerText.match(/(?:fertilizer|npk)(?:\s+is|\s+of|\s+with|\s+:)?\s+([^\d.,;:]+)/i);
      const quantityMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram|g|gram|ton|lb)/i);
      
      if (fertilizerMatch) {
        newActivity.details.fertilizer.name = fertilizerMatch[1].trim().charAt(0).toUpperCase() + 
          fertilizerMatch[1].trim().slice(1);
      } else {
        newActivity.details.fertilizer.name = 'Unspecified';
      }
      
      if (quantityMatch) {
        newActivity.details.fertilizer.quantity = quantityMatch[0].trim();
      } else {
        newActivity.details.fertilizer.quantity = 'Unspecified';
      }
    } else if (newActivity.type === 'Pesticide') {
      // Try to extract pesticide name and quantity
      const pesticideMatch = lowerText.match(/(?:pesticide|spray|chemical)(?:\s+is|\s+of|\s+with|\s+:)?\s+([^\d.,;:]+)/i);
      const quantityMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:l|ml|liter|litre)/i);
      
      if (pesticideMatch) {
        newActivity.details.pesticide.name = pesticideMatch[1].trim().charAt(0).toUpperCase() + 
          pesticideMatch[1].trim().slice(1);
      } else {
        newActivity.details.pesticide.name = 'Unspecified';
      }
      
      if (quantityMatch) {
        newActivity.details.pesticide.quantity = quantityMatch[0].trim();
      } else {
        newActivity.details.pesticide.quantity = 'Unspecified';
      }
    } else if (newActivity.type === 'Financial') {
      // Determine financial category
      let category = 'other';
      if (lowerText.includes('loan')) {
        category = 'loan';
      } else if (lowerText.includes('insur')) {
        category = 'insurance';
      } else if (lowerText.includes('invest')) {
        category = 'investment';
      } else if (lowerText.includes('subsid')) {
        category = 'subsidy';
      }
      
      // Determine payment method
      let paymentMethod = 'cash';
      if (lowerText.includes('upi') || lowerText.includes('online')) {
        paymentMethod = 'upi';
      } else if (lowerText.includes('bank') || lowerText.includes('transfer')) {
        paymentMethod = 'bank';
      } else if (lowerText.includes('cheque') || lowerText.includes('check')) {
        paymentMethod = 'cheque';
      }
      
      newActivity.details.financial.category = category;
      newActivity.details.financial.paymentMethod = paymentMethod;
    }
    
    // Convert recognized activity to form data
    const formData = {
      type: newActivity.type || '',
      name: newActivity.name || '',
      expense: newActivity.expense ? newActivity.expense.toString() : '0',
      summary: newActivity.summary || '',
      isExpense: true,
      fertilizer: {
        name: newActivity.details.fertilizer.name || '',
        quantity: newActivity.details.fertilizer.quantity || '',
        billImage: null
      },
      pesticide: {
        name: newActivity.details.pesticide.name || '',
        quantity: newActivity.details.pesticide.quantity || '',
        billImage: null
      },
      financial: {
        category: newActivity.details.financial.category || '',
        paymentMethod: newActivity.details.financial.paymentMethod || '',
        receiptImage: null
      }
    };
    
    // Set the form data and show the form
    setFormDataFromSpeech(formData);
    setShowActivityForm(true);
    
    // Reset recording states
    setTranscript("");
    setProcessingVoice(false);
    setRecording(false);
  };

  const handleAddActivity = (data: any) => {
    // Format the date and ensure values are correct types
    const formattedData = {
      ...data,
      expense: parseFloat(data.expense) || 0,
      date: new Date().toLocaleString()
    };
    
    // Format fertilizer, pesticide, or financial data if relevant
    if (formattedData.type === "Fertilizer" && formattedData.fertilizer) {
      formattedData.fertilizer = {
        name: formattedData.fertilizer.name || "",
        quantity: formattedData.fertilizer.quantity || "",
        billImage: formattedData.fertilizer.billImage || null
      };
    } else if (formattedData.type === "Pesticide" && formattedData.pesticide) {
      formattedData.pesticide = {
        name: formattedData.pesticide.name || "",
        quantity: formattedData.pesticide.quantity || "",
        billImage: formattedData.pesticide.billImage || null
      };
    } else if (formattedData.type === "Financial" && formattedData.financial) {
      formattedData.financial = {
        category: formattedData.financial.category || "",
        paymentMethod: formattedData.financial.paymentMethod || "",
        receiptImage: formattedData.financial.receiptImage || null
      };
    }
    
    // Ensure the expense value is calculated correctly
    const expenseValue = formattedData.isExpense ? formattedData.expense : -formattedData.expense;
    
    // Create a clean activity object with just the needed properties
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
    
    // Update the yield data
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
    
    // Log activity and reset form state
    console.log("New activity added:", newActivity);
    setShowActivityForm(false);
    setFormDataFromSpeech(null);
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

  const toggleStatus = () => {
    const newStatus = status === "Active" ? "Inactive" : "Active";
    setStatus(newStatus);
    console.log(`Marking yield as ${newStatus}`);
  };

  const openFinancialAnalytics = () => {
    console.log("Opening financial analytics");
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
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold mb-2">{yieldData.name}</h1>
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {yieldData.type}
                  </span>
                  <span className={`${status === "Active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"} px-3 py-1 rounded-full text-sm`}>
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
                  onClick={openFinancialAnalytics}
                  className="flex items-center gap-1"
                >
                  <PieChart className="h-5 w-5" />
                  Financial Analytics
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
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{status}</h3>
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

            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Activities</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldDetails;