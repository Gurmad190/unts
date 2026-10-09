import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Research', path: '/research' },
    { name: 'Students', path: '/students' },
    { name: 'International', path: '/international' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top bar */}
      <div className="bg-uns-navy/95 text-white text-xs py-1.5 hidden md:block border-b border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a href="tel:0905265390" className="flex items-center hover:text-uns-gold transition-colors">
              <Phone size={12} className="mr-1" />
              Admissions: 0905265390
            </a>
            <a href="mailto:info@uns.edu.so" className="hover:text-uns-gold transition-colors">
              info@uns.edu.so
            </a>
            <Link to="/login" className="hover:text-uns-gold transition-colors font-semibold">
              Portal Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-uns-navy text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              <img 
                src="/uns-logo.jpg" 
                alt="University of Northeastern Somalia Logo" 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-uns-gold"
              />
              <div className="hidden sm:block">
                <h1 className="text-xs md:text-sm font-bold leading-tight tracking-wide">UNIVERSITY OF</h1>
                <h1 className="text-xs md:text-sm font-bold leading-tight tracking-wide">NORTHEASTERN SOMALIA</h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold">UNS</h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-semibold px-3 py-2 rounded transition-all ${
                    isActive(link.path) 
                      ? 'text-uns-gold bg-white/10' 
                      : 'text-white/90 hover:text-uns-gold hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex space-x-2 ml-3">
                <Link
                  to="/apply"
                  className="bg-uns-gold text-uns-navy px-4 py-2 rounded text-xs font-bold hover:bg-yellow-400 transition-colors"
                >
                  Apply Online
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white p-2 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-uns-navy border-t border-blue-800 absolute w-full left-0 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="px-4 pt-2 pb-6 space-y-0">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? 'text-uns-gold bg-white/10'
                      : 'text-white hover:text-uns-gold hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-blue-800 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-white/10 text-white px-4 py-3 rounded-md font-bold text-base hover:bg-white/20 transition-colors"
                >
                  Portal Login
                </Link>
                <Link
                  to="/apply"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-uns-gold text-uns-navy px-4 py-3 rounded-md font-bold text-base hover:bg-yellow-400 transition-colors"
                >
                  Apply Online
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
