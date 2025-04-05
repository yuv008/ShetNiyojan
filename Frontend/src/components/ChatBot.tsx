import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MinusCircle, Move, Bot } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isHtml?: boolean; // New property to indicate if the message contains HTML
}

// Define suggestion queries
const suggestionQueries = [
  "Weather forecast for my farm",
  "How to identify tomato leaf diseases",
  "Best fertilizer for rice crop",
  "Which crops are suitable for sandy soil",
  "Water management during drought"
];

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hi there! How can I help you with your agriculture queries today?", 
      isUser: false, 
      timestamp: new Date(),
      isHtml: false
    }
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

  // Function to call the backend API
  const fetchBotResponse = async (userMessage: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 400
      });
      
      return response.data.response;
    } catch (error) {
      console.error('Error fetching bot response:', error);
      toast.error('Failed to get response from the chatbot');
      return "I'm sorry, I encountered an error processing your request. Please try again later.";
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Hide suggestions after one is clicked
    setShowSuggestions(false);
    
    // Process the suggestion as if it was typed by the user
    const userMessage: Message = {
      text: suggestion,
      isUser: true,
      timestamp: new Date(),
      isHtml: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Get response from the API
      const botResponseText = await fetchBotResponse(suggestion);
      
      const botMessage: Message = {
        text: botResponseText,
        isUser: false,
        timestamp: new Date(),
        isHtml: true // Mark as HTML since it's coming from the API
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error handling suggestion:', error);
      
      // Fallback response in case of error
      const botMessage: Message = {
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        isHtml: false
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
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
      timestamp: new Date(),
      isHtml: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input; // Store input before clearing it
    setInput('');
    setIsTyping(true);
    
    try {
      // Get response from the API
      const botResponseText = await fetchBotResponse(userInput);
      
      const botMessage: Message = {
        text: botResponseText,
        isUser: false,
        timestamp: new Date(),
        isHtml: true // Mark as HTML since it's coming from the API
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error handling message:', error);
      
      // Fallback response in case of error
      const botMessage: Message = {
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        isHtml: false
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Format timestamp to show only hours and minutes
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Helper function to safely render HTML content
  const renderMessageContent = (message: Message) => {
    if (message.isHtml) {
      return (
        <div 
          className="text-sm chat-html-content" 
          dangerouslySetInnerHTML={{ __html: message.text }}
          style={{
            lineHeight: '1.5',
            maxWidth: '100%',
            overflow: 'auto',
            wordBreak: 'break-word'
          }}
        />
      );
    } else {
      return <p className="text-sm">{message.text}</p>;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-agrigreen text-white rounded-full p-3 shadow-lg hover:bg-agrigreen-dark transition-colors duration-300 hover:scale-105 transform"
          aria-label="Open chat"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div 
          ref={resizableRef}
          className="bg-white rounded-lg shadow-xl flex flex-col border border-gray-200 relative overflow-hidden"
          style={{ 
            width: `${size.width}px`, 
            height: `${size.height}px`,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Chat header */}
          <div className="bg-agrigreen text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Agri Assistant</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-gray-200 hover:bg-agrigreen-dark/50 rounded-full p-1 transition-colors"
                aria-label="Minimize chat"
              >
                <MinusCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={toggleChat} 
                className="text-white hover:text-gray-200 hover:bg-agrigreen-dark/50 rounded-full p-1 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 shadow-sm ${
                    message.isUser
                      ? 'bg-agrigreen-light text-gray-800'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                  style={{
                    maxWidth: message.isUser ? '80%' : '85%',
                    wordBreak: 'break-word',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}
                >
                  {renderMessageContent(message)}
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
                      className="bg-white hover:bg-agrigreen-light/60 text-agrigreen-dark text-sm px-3 py-1 rounded-full transition-colors border border-agrigreen-light/50 shadow-sm"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="bg-agrigreen rounded-full h-2 w-2 animate-bounce"></div>
                    <div className="bg-agrigreen rounded-full h-2 w-2 animate-bounce delay-100"></div>
                    <div className="bg-agrigreen rounded-full h-2 w-2 animate-bounce delay-200"></div>
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
              className="flex-1 bg-gray-100 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-agrigreen/50"
            />
            <button
              type="submit"
              className="bg-agrigreen text-white px-4 py-2 rounded-r-lg hover:bg-agrigreen-dark transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add global styles for HTML content in the chatbot */}
      <style>
        {`
          .chat-html-content h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0.8rem 0 0.4rem 0;
            color: #2d5a2e;
          }
          .chat-html-content p {
            margin-bottom: 0.6rem;
          }
          .chat-html-content ul, .chat-html-content ol {
            padding-left: 1.2rem;
            margin: 0.5rem 0;
          }
          .chat-html-content li {
            margin-bottom: 0.3rem;
          }
          .chat-html-content strong {
            font-weight: 600;
          }
          .chat-html-content a {
            color: #4e8c5c;
            text-decoration: underline;
          }
        `}
      </style>
    </div>
  );
};

export default ChatBot; 