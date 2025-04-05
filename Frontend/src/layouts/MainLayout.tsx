import React from "react";
import DashboardHeader from "@/components/common/DashboardHeader";
import LanguageSelector from "@/components/common/LanguageSelector";

interface MainLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  searchQuery = "",
  onSearchChange = () => {},
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
        {/* Add a floating language selector button for easy access on all pages */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 