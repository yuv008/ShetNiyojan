import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

const Marketplace: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-agriBg">
      {/* Sidebar */}
      <div className="w-16 m-3 h-[calc(100vh-2rem)] fixed">
        <DashboardSidebar />
      </div>

      {/* Main Content - Empty */}
      <div className="flex-1 ml-16 p-4">
        {/* Empty content area */}
      </div>
    </div>
  );
};

export default Marketplace; 