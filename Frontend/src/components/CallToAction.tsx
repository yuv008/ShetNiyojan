
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <div className="bg-gray-900 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-sm font-semibold text-agriorange uppercase mb-2">TRY AGRIFUTURE</h2>
        <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Take Your Farm <br className="hidden sm:block" />
          to The Next Level?
        </h3>
        <Link to="/register">
          <Button className="bg-agrigreen hover:bg-agrigreen-dark text-white px-8 py-3 rounded-md text-lg">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CallToAction;
