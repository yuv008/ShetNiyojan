import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslator } from "@/lib/translator-context";

const LanguageSelector = () => {
  const { currentLang, isInitialized, changeLanguage, supportedLanguages } = useTranslator();

  return (
    <div className="flex items-center">
      <Select 
        value={currentLang} 
        onValueChange={changeLanguage}
        disabled={!isInitialized}
      >
        <SelectTrigger className="w-[160px] flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors">
          <Globe className="h-4 w-4 text-blue-500" />
          <SelectValue />
          {!isInitialized && <span className="ml-2 text-xs text-gray-400">(Loading...)</span>}
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <span>{lang.name}</span>
                {currentLang === lang.code && (
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector; 