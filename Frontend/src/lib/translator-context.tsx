import React, { createContext, useState, useContext, useEffect, useRef } from "react";

// Define available languages
const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
];

// Constants
const LANGUAGE_STORAGE_KEY = "preferred_language";
const GOOGLE_TRANSLATE_ID = "google_translate_element";
const SCRIPT_ID = "google_translate_script";
const STYLE_ID = "google_translate_style";
const TRANSLATE_CONTAINER_ID = "translate-container"; // Container outside React's control

// Type definitions
interface TranslatorContextType {
  currentLang: string;
  isInitialized: boolean;
  changeLanguage: (langCode: string) => void;
  supportedLanguages: typeof languages;
}

// Create context with default values
const TranslatorContext = createContext<TranslatorContextType>({
  currentLang: "en",
  isInitialized: false,
  changeLanguage: () => {},
  supportedLanguages: languages,
});

// Create a container element outside of React's control that won't be affected by React's DOM operations
const createTranslateContainer = () => {
  // Check if container already exists
  if (!document.getElementById(TRANSLATE_CONTAINER_ID)) {
    const container = document.createElement('div');
    container.id = TRANSLATE_CONTAINER_ID;
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '0';
    container.style.height = '0';
    container.style.overflow = 'hidden';
    container.style.visibility = 'hidden';
    
    document.body.appendChild(container);
    return container;
  }
  
  return document.getElementById(TRANSLATE_CONTAINER_ID);
};

// Create provider component
export const TranslatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const translatorInitialized = useRef(false);
  const translationAttempted = useRef(false);

  // Initialize translator on component mount
  useEffect(() => {
    // Skip if already initialized
    if (translatorInitialized.current) return;

    // Create the container outside React's control
    const container = createTranslateContainer();
    
    // Only proceed if we have the container
    if (!container) {
      console.error('Failed to create translate container');
      return;
    }

    // Create the hidden translate element inside our container
    const translateElement = document.createElement("div");
    translateElement.id = GOOGLE_TRANSLATE_ID;
    container.appendChild(translateElement);

    // Add custom styles
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .goog-te-banner-frame.skiptranslate,
        .goog-te-gadget-icon,
        .goog-te-spinner-pos,
        .goog-te-spinner {
          display: none !important;
        }
        .goog-te-gadget {
          height: 0;
          overflow: hidden;
        }
        body {
          top: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Define the callback function for Google Translate
    window.googleTranslateElementInit = () => {
      try {
        const element = document.getElementById(GOOGLE_TRANSLATE_ID);
        if (!element) {
          console.warn("Google Translate element not found");
          return;
        }

        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: languages.map(lang => lang.code).join(","),
            layout: window.google.translate.TranslateElement.InlineLayout.NONE,
            autoDisplay: false,
            gaTrack: false,
          },
          GOOGLE_TRANSLATE_ID
        );
        
        translatorInitialized.current = true;
        setIsInitialized(true);
        
        // If a non-English language was set, apply it after initialization
        if (currentLang !== "en" && !translationAttempted.current) {
          setTimeout(() => applyLanguage(currentLang), 500);
          translationAttempted.current = true;
        }
      } catch (error) {
        console.error("Failed to initialize Google Translate:", error);
      }
    };

    // Add the Google Translate script if it's not already loaded
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // This component should never unmount during the app lifecycle, so we don't
    // need a cleanup function for the main Google Translate resources
  }, [currentLang]);

  // Listen for changes to route and reapply language if needed
  useEffect(() => {
    if (isInitialized && currentLang !== "en") {
      // Apply language immediately
      applyLanguage(currentLang);
      
      // Create a mutation observer to detect when the DOM changes
      // (which happens during navigation)
      const observer = new MutationObserver((mutations) => {
        // We'll debounce the language reapplication to avoid multiple calls
        // during consecutive DOM changes
        window.clearTimeout(window.googleTranslateDebounce as any);
        
        (window as any).googleTranslateDebounce = setTimeout(() => {
          applyLanguage(currentLang);
        }, 500);
      });
      
      // Start observing the document body with the configured parameters
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
      });
      
      // Cleanup observer on unmount
      return () => {
        observer.disconnect();
        window.clearTimeout((window as any).googleTranslateDebounce);
      };
    }
  }, [isInitialized, currentLang]);

  // Function to apply language change
  const applyLanguage = (langCode: string) => {
    try {
      // Use a timeout to ensure the Google Translate widget has finished rendering
      setTimeout(() => {
        const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (selectElement && selectElement.value !== langCode) {
          selectElement.value = langCode;
          selectElement.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("Applied language:", langCode);
        }
      }, 100);
    } catch (error) {
      console.error("Error applying language:", error);
    }
  };

  // Function to change language
  const changeLanguage = (langCode: string) => {
    if (!isInitialized) {
      console.warn("Google Translate not initialized yet");
      return;
    }

    // Update state and localStorage
    setCurrentLang(langCode);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
    
    // Apply the language change
    applyLanguage(langCode);
  };

  // The context value
  const contextValue: TranslatorContextType = {
    currentLang,
    isInitialized,
    changeLanguage,
    supportedLanguages: languages,
  };

  return (
    <TranslatorContext.Provider value={contextValue}>
      {children}
    </TranslatorContext.Provider>
  );
};

// Custom hook to use the translator context
export const useTranslator = () => useContext(TranslatorContext);

// Add type definition for the Google Translate API and our debounce property
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    googleTranslateDebounce?: NodeJS.Timeout;
    google: {
      translate: {
        TranslateElement: {
          new (options: any, element: string): any;
          InlineLayout: {
            NONE: number;
          };
        };
      };
    };
  }
} 