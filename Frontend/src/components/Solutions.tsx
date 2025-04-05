import { Monitor, TrendingUp, GraduationCap } from 'lucide-react';

const Solutions = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-agriorange uppercase mb-2">BENEFIT OF ShetNiyojan</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What ShetNiyojan Solutions <br className="hidden sm:block" />
            Are You Seeking?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Solution 1 */}
          <div className="bg-agriBg p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-agrigreen/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Monitor className="text-agrigreen h-6 w-6" />
            </div>
            <h4 className="text-xl font-semibold mb-3">Smart Farming Technology</h4>
            <p className="text-gray-600">
              IoT-enabled devices monitor crops and soil, while real-time analytics support better decision-making.
            </p>
          </div>

          {/* Solution 2 */}
          <div className="bg-agriBg p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-agrigreen/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="text-agrigreen h-6 w-6" />
            </div>
            <h4 className="text-xl font-semibold mb-3">Market Access and Insights</h4>
            <p className="text-gray-600">
              Connect farmers to buyers through our marketplace and gain insights into crop demand and pricing trends.
            </p>
          </div>

          {/* Solution 3 */}
          <div className="bg-agriBg p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-agrigreen/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <GraduationCap className="text-agrigreen h-6 w-6" />
            </div>
            <h4 className="text-xl font-semibold mb-3">Education and Training</h4>
            <p className="text-gray-600">
              Resources and workshops to help farmers adopt modern farming methods and embrace sustainability and solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solutions;
