import React from 'react';
import { Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Have questions? We're here to help. Reach out to the University of Northeastern Somalia.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-uns-navy mb-6">Get in Touch</h2>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <div className="bg-uns-navy text-uns-gold p-3 rounded-lg">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-uns-navy text-sm">Location</h3>
                      <p className="text-gray-600 text-sm">Garowe, Puntland, Somalia</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-uns-navy text-uns-gold p-3 rounded-lg">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-uns-navy text-sm">Phone Numbers</h3>
                      <a href="tel:+0905265390" className="block text-gray-600 text-sm hover:text-uns-gold transition-colors">Admissions: 0905265390</a>
                      <a href="tel:+0907221645" className="block text-gray-600 text-sm hover:text-uns-gold transition-colors">Academics: 0907221645</a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-uns-navy text-uns-gold p-3 rounded-lg">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-uns-navy text-sm">Email Addresses</h3>
                      <a href="mailto:info@uns.edu.so" className="block text-gray-600 text-sm hover:text-uns-gold transition-colors">General: info@uns.edu.so</a>
                      <a href="mailto:Ashkir@uns.edu.so" className="block text-gray-600 text-sm hover:text-uns-gold transition-colors">Academics: Ashkir@uns.edu.so</a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-uns-navy text-uns-gold p-3 rounded-lg">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-uns-navy text-sm">Office Hours</h3>
                      <p className="text-gray-600 text-sm">Saturday - Thursday</p>
                      <p className="text-gray-600 text-sm">8:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <a
                  href="tel:+0905265390"
                  className="block w-full bg-uns-navy text-white py-3 rounded-lg font-bold text-sm text-center hover:bg-blue-900 transition-colors"
                >
                  Call Admissions: 0905265390
                </a>
                <a
                  href="https://wa.me/0905265390"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white py-3 rounded-lg font-bold text-sm text-center hover:bg-green-700 transition-colors"
                >
                  WhatsApp Us
                </a>
                <a
                  href="mailto:info@uns.edu.so"
                  className="block w-full border-2 border-uns-navy text-uns-navy py-3 rounded-lg font-bold text-sm text-center hover:bg-uns-navy hover:text-white transition-colors"
                >
                  Email: info@uns.edu.so
                </a>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="font-bold text-uns-navy mb-3 text-sm">Official Website</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <Globe size={16} className="text-uns-gold" />
                  <a href="https://uns.edu.so" target="_blank" rel="noopener noreferrer" className="text-uns-navy font-bold hover:text-uns-gold transition-colors">
                    uns.edu.so
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-8 md:p-12 rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-uns-navy mb-8">Send us a Message</h2>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = 'mailto:info@uns.edu.so?subject=Enquiry from UNS Website'; }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uns-navy focus:border-transparent outline-none transition-all bg-white"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uns-navy focus:border-transparent outline-none transition-all bg-white"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uns-navy focus:border-transparent outline-none transition-all bg-white"
                        placeholder="090..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                      <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uns-navy focus:border-transparent outline-none transition-all bg-white">
                        <option>General Inquiry</option>
                        <option>Admissions</option>
                        <option>Academics</option>
                        <option>Research</option>
                        <option>Career Development</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                    <textarea 
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uns-navy focus:border-transparent outline-none transition-all resize-none bg-white"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-uns-navy text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition-all shadow-lg"
                  >
                    Send Message
                  </button>
                </form>
                <p className="text-gray-500 text-xs mt-4 text-center">
                  This will open your email client. You can also call us directly at{' '}
                  <a href="tel:+0905265390" className="text-uns-navy font-bold hover:text-uns-gold">0905265390</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[300px] bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
          <div className="text-center">
            <MapPin size={40} className="text-uns-navy mx-auto mb-3" />
            <h3 className="text-lg font-bold text-uns-navy">UNS Campus Location</h3>
            <p className="text-gray-600 text-sm">Garowe, Puntland, Somalia</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
