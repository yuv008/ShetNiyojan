import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  logo?: string;
}

const Navbar = ({ logo }: NavbarProps = {}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {logo ? (
              <img src={logo} alt="ShetNiyojan Logo" className="h-10 w-auto" />
            ) : (
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-agrigreen"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM10 14C11.105 14 12 13.105 12 12C12 10.895 11.105 10 10 10C8.895 10 8 10.895 8 12C8 13.105 8.895 14 10 14ZM22 14C23.105 14 24 13.105 24 12C24 10.895 23.105 10 22 10C20.895 10 20 10.895 20 12C20 13.105 20.895 14 22 14ZM22 20C22 23.314 19.314 26 16 26C12.686 26 10 23.314 10 20H22Z"
                  fill="currentColor"
                />
              </svg>
            )}
            <span className="ml-2 text-xl font-bold text-gray-900">ShetNiyojan</span>
          </Link>

          {/* Desktop Menu */}
          {/* <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-agrigreen">Home</Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-agrigreen">Dashboard</Link>
            <Link to="/tasks" className="text-gray-700 hover:text-agrigreen">Tasks</Link>
            <Link to="/projects" className="text-gray-700 hover:text-agrigreen">Projects</Link>
          </nav> */}

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="border-agrigreen text-agrigreen hover:bg-agrigreen hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-agrigreen hover:bg-agrigreen-dark text-white">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              to="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-agrigreen"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-agrigreen"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-agrigreen"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tasks
            </Link>
            <Link
              to="/projects"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-agrigreen"
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-agrigreen text-agrigreen hover:bg-agrigreen hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-agrigreen hover:bg-agrigreen-dark text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
