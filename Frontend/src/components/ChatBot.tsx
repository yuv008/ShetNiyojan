import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, MinusCircle, Move } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Define suggestion queries
const suggestionQueries = [
  "Weather forecast",
  "Crop disease help",
  "Fertilizer recommendations",
  "Best crops to plant",
  "Water management"
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi there! How can I help you with your agriculture queries today?", isUser: false, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Resizing state
  const [size, setSize] = useState({ width: 320, height: 450 });
  const [isResizing, setIsResizing] = useState(false);
  const resizableRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 320, height: 450 });

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up resize event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startPositionRef.current.x;
      const deltaY = e.clientY - startPositionRef.current.y;

      // Calculate new dimensions (with minimum sizes)
      const newWidth = Math.max(280, startSizeRef.current.width + deltaX);
      const newHeight = Math.max(350, startSizeRef.current.height + deltaY);

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPositionRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { ...size };
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Hide suggestions after one is clicked
    setShowSuggestions(false);
    
    // Process the suggestion as if it was typed by the user
    const userMessage: Message = {
      text: suggestion,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Generate bot response based on the suggestion
    setTimeout(() => {
      let botResponse = "";
      
      if (suggestion.toLowerCase().includes('weather')) {
        botResponse = "I can provide weather forecasts for agricultural planning. Please specify your location for accurate information.";
      } else if (suggestion.toLowerCase().includes('disease')) {
        botResponse = "For crop disease identification, you can upload plant images in our Crop Health Monitoring section, or describe the symptoms here and I'll try to help.";
      } else if (suggestion.toLowerCase().includes('fertilizer')) {
        botResponse = "Fertilizer recommendations depend on your crop type, growth stage, and soil condition. Would you like advice for a specific crop?";
      } else if (suggestion.toLowerCase().includes('crops to plant')) {
        botResponse = "Crop selection depends on your climate, soil type, water availability, and market demand. Our Crop Prediction tool can help you make data-driven decisions based on your specific conditions.";
      } else if (suggestion.toLowerCase().includes('water')) {
        botResponse = "Efficient water management is crucial for sustainable farming. I can provide advice on irrigation scheduling, water conservation techniques, and drought management strategies.";
      }
      
      const botMessage: Message = {
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Hide suggestions once the user sends their first message
    setShowSuggestions(false);
    
    // Add user message
    const userMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      let botResponse = "";
      
      // Simple keyword matching
      const lowerCaseInput = input.toLowerCase();
      
      if (lowerCaseInput.includes('hello') || lowerCaseInput.includes('hi')) {
        botResponse = "Hello! How can I assist you with your farming needs today?";
      } else if (lowerCaseInput.includes('weather')) {
        botResponse = "I can help you with weather forecasts. Please specify your location for accurate information.";
      } else if (lowerCaseInput.includes('crop') && lowerCaseInput.includes('disease')) {
        botResponse = "For crop disease identification, please upload an image in the Crop Health Monitoring section or describe the symptoms here.";
      } else if (lowerCaseInput.includes('fertilizer') || lowerCaseInput.includes('fertiliser')) {
        botResponse = "Fertilizer recommendations depend on your crop type and soil condition. Would you like specific advice?";
      } else {
        botResponse = "Thank you for your question. I'll help you find the information you need about agriculture and farming.";
      }
      
      const botMessage: Message = {
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Format timestamp to show only hours and minutes
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-agrigreen text-white rounded-full p-3 shadow-lg hover:bg-agrigreen-dark transition-colors duration-300"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div 
          ref={resizableRef}
          className="bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 relative"
          style={{ 
            width: `${size.width}px`, 
            height: `${size.height}px` 
          }}
        >
          {/* Chat header */}
          <div className="bg-agrigreen text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Agri Assistant</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-gray-200"
                aria-label="Minimize chat"
              >
                <MinusCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-gray-200"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.isUser
                      ? 'bg-agrigreen-light text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-right text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Suggestion queries */}
            {showSuggestions && messages.length === 1 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Try asking about:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestionQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(query)}
                      className="bg-agrigreen-light/40 hover:bg-agrigreen-light/60 text-agrigreen-dark text-sm px-3 py-1 rounded-full transition-colors"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce"></div>
                    <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce delay-100"></div>
                    <div className="bg-gray-400 rounded-full h-2 w-2 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 rounded-l-lg px-4 py-2 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-agrigreen text-white px-4 py-2 rounded-r-lg hover:bg-agrigreen-dark transition-colors duration-300"
              disabled={!input.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          
          {/* Resize handle */}
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center opacity-70 hover:opacity-100"
            onMouseDown={startResize}
          >
            <Move className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 