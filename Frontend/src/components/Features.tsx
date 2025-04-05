import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
interface HeroProps {
  dashboardImage?: string;
}
const Features = ({ dashboardImage }: HeroProps = {}) => {
  const [openAccordion, setOpenAccordion] = useState("item-1");

  return (
    <div className="bg-agriBg py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-agriorange uppercase mb-2">WHY ShetNiyojan</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
            Innovative, Sustainable, <br className="hidden sm:block" />
            and Efficient Solutions
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Accordion Features - Left Side */}
          <div className="lg:col-span-2">
            <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
              <AccordionItem value="item-1" className="border-b border-gray-200 pb-2">
                <AccordionTrigger className="py-4 flex justify-between items-center w-full text-left">
                  <div className="flex items-center">
                    <span className="text-agriorange font-semibold mr-4">01</span>
                    <span className="font-semibold">Precision Agriculture with IoT and Sensors</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 pl-10">
                  Real-time monitoring of soil health, moisture levels, weather conditions, and crop growth using IoT devices and sensors.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-gray-200 pb-2">
                <AccordionTrigger className="py-4 flex justify-between items-center w-full text-left">
                  <div className="flex items-center">
                    <span className="text-agriorange font-semibold mr-4">02</span>
                    <span className="font-semibold">Smart Irrigation Systems</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 pl-10">
                  Automated irrigation systems that optimize water usage based on soil conditions, weather forecasts, and plant needs, reducing waste and improving efficiency.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-gray-200 pb-2">
                <AccordionTrigger className="py-4 flex justify-between items-center w-full text-left">
                  <div className="flex items-center">
                    <span className="text-agriorange font-semibold mr-4">03</span>
                    <span className="font-semibold">AI-Powered Crop Management</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 pl-10">
                  Advanced algorithms that analyze farm data to provide predictive insights for pest control, disease prevention, and optimal harvest timing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-gray-200 pb-2">
                <AccordionTrigger className="py-4 flex justify-between items-center w-full text-left">
                  <div className="flex items-center">
                    <span className="text-agriorange font-semibold mr-4">04</span>
                    <span className="font-semibold">Data-Driven Transparency</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 pl-10">
                  Blockchain and data management tools that provide complete transparency across the supply chain from farm to table, building trust with consumers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Feature Image - Right Side */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <img  
              src={dashboardImage} 
              alt="Advanced Irrigation System" 
              className="rounded-lg shadow-lg object-cover w-full h-auto max-h-[400px]" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
