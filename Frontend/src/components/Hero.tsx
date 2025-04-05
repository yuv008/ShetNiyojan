import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  dashboardImage?: string;
}

const Hero = ({ dashboardImage }: HeroProps = {}) => {
  return (
    <div className="relative w-full bg-gradient-to-r from-[#2C5F34]/10 to-[#2C5F34]/5 py-12 lg:py-16 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 md:pr-8 opacity-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Driving the Future <br />of Agriculture
            </h1>
            <p className="text-lg text-gray-700">
              Modernizing plantation operations with tech-driven solutions
              for a greener and more productive future
            </p>
            <div className="pt-4">
              <Button className="bg-agrigreen hover:bg-agrigreen-dark text-white px-6 py-2 rounded-md transition-all flex items-center">
                Explore Solutions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {/* Trusted by section */}
            <div className="pt-8">
              <p className="text-sm text-gray-500 mb-4">Trusted by 100+ Companies</p>
              <div className="flex flex-wrap items-center gap-8">
                <div className="text-gray-500 opacity-75">
                  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 17.52L18.34 21L16.8 13.97L22.4 9.24L15.23 8.63L12 2L8.77 8.63L1.6 9.24L7.2 13.97L5.66 21L12 17.52Z" fill="#6B7280"/>
                  </svg>
                </div>
                <div className="text-gray-500 opacity-75">
                  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 6H8C6.9 6 6 6.9 6 8V16C6 17.1 6.9 18 8 18H16C17.1 18 18 17.1 18 16V8C18 6.9 17.1 6 16 6ZM10 16H8V12H10V16ZM10 10H8V8H10V10ZM16 16H12V14H16V16ZM16 12H12V8H16V12Z" fill="#6B7280"/>
                  </svg>
                </div>
                <div className="text-gray-500 opacity-75">
                  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6L7 12H17L12 18M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#6B7280"/>
                  </svg>
                </div>
                <div className="text-gray-500 opacity-75">
                  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#6B7280"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Dashboard Image */}
          <div className="relative opacity-0 animate-fade-in animate-delay-200">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              <img 
                src={dashboardImage || "/lovable-uploads/f28294f6-2bf0-43de-a9af-b96da5f7fd3b.png"} 
                alt="Agricultural Dashboard" 
                className="w-full h-auto object-cover rounded-md"
              />
            </div>
            
            {/* Floating Chart Elements */}
            <div className="absolute -top-4 -left-4 bg-white p-3 rounded-lg shadow-lg w-40 opacity-95 hidden md:block">
              <div className="text-xs font-semibold mb-1">Top 5 Field of Farms</div>
              <div className="grid grid-cols-5 gap-1">
                {[...Array(15)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-3 rounded-sm ${index % 3 === 0 ? 'bg-agriorange' : 'bg-amber-300'}`}
                  ></div>
                ))}
              </div>
            </div>
            
            <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-lg shadow-lg hidden md:block">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-agriorange text-white font-semibold text-xs mr-3">
                  +25%
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-16 bg-agrigreen rounded-full"></div>
                  <div className="h-2 w-10 bg-agriorange rounded-full"></div>
                  <div className="h-2 w-12 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
