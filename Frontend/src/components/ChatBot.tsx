import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, MinusCircle } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi there! How can I help you with your agriculture queries today?", isUser: false, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
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
        <div className="bg-white rounded-lg shadow-xl flex flex-col w-80 h-96 border border-gray-200">
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
        </div>
      )}
    </div>
  );
};

export default ChatBot; 