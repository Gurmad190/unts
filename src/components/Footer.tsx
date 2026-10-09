import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-uns-navy text-white pt-12 pb-24 md:pb-6 border-t-4 border-uns-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* University Info */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <img 
                src="/uns-logo.jpg" 
                alt="UNS Logo" 
                className="w-12 h-12 rounded-full object-cover border-2 border-uns-gold"
              />
              <div>
                <h2 className="text-sm font-bold leading-tight">University of</h2>
                <h2 className="text-sm font-bold leading-tight">Northeastern Somalia</h2>
              </div>
            </Link>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Great Minds Build Nations — A university committed to quality education, research, professional development, and meaningful community impact.
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-uns-gold hover:text-uns-navy transition-all" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-uns-gold hover:text-uns-navy transition-all" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-uns-gold hover:text-uns-navy transition-all" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="https://wa.me/0905265390" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-600 transition-all text-sm font-bold" aria-label="WhatsApp">
                W
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-uns-gold font-bold text-sm mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-uns-gold transition-colors">About UNS</Link></li>
              <li><Link to="/academics" className="hover:text-uns-gold transition-colors">Academic Programs</Link></li>
              <li><Link to="/admissions" className="hover:text-uns-gold transition-colors">Admissions</Link></li>
              <li><Link to="/research" className="hover:text-uns-gold transition-colors">Research</Link></li>
              <li><Link to="/students" className="hover:text-uns-gold transition-colors">Student Experience</Link></li>
              <li><Link to="/international" className="hover:text-uns-gold transition-colors">International</Link></li>
              <li><Link to="/career" className="hover:text-uns-gold transition-colors">Career Development</Link></li>
              <li><Link to="/news" className="hover:text-uns-gold transition-colors">News & Events</Link></li>
            </ul>
          </div>

          {/* Student Resources */}
          <div>
            <h3 className="text-uns-gold font-bold text-sm mb-6 uppercase tracking-wider">Student Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/apply" className="hover:text-uns-gold transition-colors">Apply Online</Link></li>
              <li><Link to="/academics" className="hover:text-uns-gold transition-colors">Online Learning</Link></li>
              <li><Link to="/career" className="hover:text-uns-gold transition-colors">Career Services</Link></li>
              <li><Link to="/students" className="hover:text-uns-gold transition-colors">Student Support</Link></li>
              <li><Link to="/research" className="hover:text-uns-gold transition-colors">Research Opportunities</Link></li>
              <li><Link to="/contact" className="hover:text-uns-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-uns-gold font-bold text-sm mb-6 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-uns-gold mt-0.5 flex-shrink-0" />
                <span className="text-blue-100">Garowe, Puntland, Somalia</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone size={16} className="text-uns-gold mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:0905265390" className="text-blue-100 hover:text-uns-gold transition-colors">Admissions: 0905265390</a>
                  <a href="tel:0907221645" className="text-blue-100 hover:text-uns-gold transition-colors">Academics: 0907221645</a>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail size={16} className="text-uns-gold mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="mailto:info@uns.edu.so" className="text-blue-100 hover:text-uns-gold transition-colors">info@uns.edu.so</a>
                  <a href="mailto:Ashkir@uns.edu.so" className="text-blue-100 hover:text-uns-gold transition-colors">Ashkir@uns.edu.so</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-200 text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} University of Northeastern Somalia. All rights reserved.
          </p>
          <div className="flex space-x-4 text-xs text-blue-200">
            <Link to="#" className="hover:text-uns-gold transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-uns-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
