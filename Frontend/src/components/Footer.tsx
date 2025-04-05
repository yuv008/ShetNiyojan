import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  logo?: string;
}

const Footer = ({ logo }: FooterProps = {}) => {
  return (
    <footer className="bg-white py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and About */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              {logo ? (
                <div className="flex items-center">
                  <img src={logo} alt="ShetNiyojan Logo" className="h-8 w-auto mr-2" />
                  <span className="text-agrigreen font-bold text-2xl">ShetNiyojan</span>
                </div>
              ) : (
                <div className="text-agrigreen font-bold text-2xl flex items-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                    <path d="M20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20Z" stroke="#3A7D44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 8H22" stroke="#3A7D44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 16L8 14L10 16L14 12L16 14L18 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  ShetNiyojan
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-6">
              Empowering farmers with modern project management tools for better agricultural planning and execution.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-agrigreen">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-agrigreen">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-agrigreen">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-agrigreen">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><a href="/dashboard" className="text-gray-600 hover:text-agrigreen">Dashboard</a></li>
              <li><a href="/tasks" className="text-gray-600 hover:text-agrigreen">Task Management</a></li>
              <li><a href="/projects" className="text-gray-600 hover:text-agrigreen">Project Planning</a></li>
              <li><a href="/reports" className="text-gray-600 hover:text-agrigreen">Reports</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-600 hover:text-agrigreen">About Us</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-agrigreen">Contact</a></li>
              <li><a href="/support" className="text-gray-600 hover:text-agrigreen">Support</a></li>
              <li><a href="/careers" className="text-gray-600 hover:text-agrigreen">Careers</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/docs" className="text-gray-600 hover:text-agrigreen">Documentation</a></li>
              <li><a href="/blog" className="text-gray-600 hover:text-agrigreen">Blog</a></li>
              <li><a href="/guides" className="text-gray-600 hover:text-agrigreen">User Guides</a></li>
              <li><a href="/api" className="text-gray-600 hover:text-agrigreen">API Reference</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ShetNiyojan. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="/terms" className="text-gray-500 hover:text-gray-700 text-sm">Terms of Service</a>
              <a href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm">Privacy Policy</a>
              <a href="/cookies" className="text-gray-500 hover:text-gray-700 text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
