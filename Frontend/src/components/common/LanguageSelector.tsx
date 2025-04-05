import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

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

const GOOGLE_TRANSLATE_ID = "google_translate_element";
const SCRIPT_ID = "google_translate_script";
const STYLE_ID = "google_translate_style";

const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState("en");
  const [isInitialized, setIsInitialized] = useState(false);
  const translatorInitialized = useRef(false);

  useEffect(() => {
    // Cleanup function to be called on unmount
    const cleanup = () => {
      try {
        // Remove script
        const script = document.getElementById(SCRIPT_ID);
        if (script) {
          script.remove();
        }

        // Remove style
        const style = document.getElementById(STYLE_ID);
        if (style) {
          style.remove();
        }

        // Remove Google Translate elements
        const element = document.getElementById(GOOGLE_TRANSLATE_ID);
        if (element) {
          element.remove();
        }

        // Remove other Google Translate elements
        const banner = document.querySelector(".goog-te-banner-frame");
        if (banner) {
          banner.remove();
        }

        // Reset body top style
        document.body.style.top = "";
        document.body.classList.remove("skiptranslate");

      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };

    // Initialize Google Translate
    const initializeTranslator = () => {
      if (translatorInitialized.current) return;

      try {
        // Add custom styles
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

        // Create Google Translate script
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        script.onerror = () => {
          console.error("Failed to load Google Translate script");
          cleanup();
        };

        // Define the callback function
        window.googleTranslateElementInit = () => {
          try {
            if (!document.getElementById(GOOGLE_TRANSLATE_ID)) return;

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
          } catch (error) {
            console.error("Failed to initialize Google Translate:", error);
          }
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    // Initialize only if not already done
    if (!translatorInitialized.current) {
      initializeTranslator();
    }

    // Cleanup on unmount
    return cleanup;
  }, []);

  const handleLanguageChange = (langCode: string) => {
    try {
      if (!isInitialized) {
        console.warn("Google Translate not initialized yet");
        return;
      }

      setCurrentLang(langCode);
      
      const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        console.warn("Google Translate selector not found");
      }
    } catch (error) {
      console.error("Language change error:", error);
    }
  };

  return (
    <div className="flex items-center">
      <div id={GOOGLE_TRANSLATE_ID} className="hidden" />
      
      <Select 
        value={currentLang} 
        onValueChange={handleLanguageChange}
        disabled={!isInitialized}
      >
        <SelectTrigger className="w-[140px] flex items-center gap-2 bg-white">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Add type definition for the Google Translate API
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
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

export default LanguageSelector; 