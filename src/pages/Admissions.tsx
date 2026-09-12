import React from 'react';
import { CheckCircle2, Phone, Mail, ArrowRight, BookOpen, Users, Award, Globe, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admissions: React.FC = () => {
  const steps = [
    { title: 'Choose Your Program', desc: 'Explore the available undergraduate programs across our four academic areas.' },
    { title: 'Review Requirements', desc: 'Check the requirements for your selected program to ensure you are eligible.' },
    { title: 'Prepare Your Documents', desc: 'Gather all necessary academic transcripts, identification, and other required documents.' },
    { title: 'Submit Your Application', desc: 'Complete and submit your application through our admissions office.' },
    { title: 'Follow Your Application', desc: 'Contact the Admissions Office for updates on your application status.' },
  ];

  const whyUns = [
    { title: '17 Programs', desc: 'Undergraduate programs across four academic areas', icon: <BookOpen size={24} /> },
    { title: 'Flexible Learning', desc: 'On-campus and online learning options', icon: <Globe size={24} /> },
    { title: 'Dedicated Faculty', desc: 'Committed educators focused on student success', icon: <Users size={24} /> },
    { title: 'Career Support', desc: 'Comprehensive graduate career development', icon: <Award size={24} /> },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Admissions</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Join the University of Northeastern Somalia and take the first step towards a successful career.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="https://wa.me/0905265390" target="_blank" rel="noopener noreferrer" className="bg-uns-gold text-uns-navy px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-all flex items-center shadow-lg w-full sm:w-auto justify-center">
              <MessageCircle className="mr-2" size={24} />
              Apply Now via WhatsApp
            </a>
            <a href="tel:+0905265390" className="bg-white text-uns-navy px-8 py-4 rounded-md font-bold text-lg hover:bg-gray-100 transition-all flex items-center shadow-lg w-full sm:w-auto justify-center">
              <Phone className="mr-2" size={24} />
              Call Admissions
            </a>
          </div>
        </div>
      </section>

      {/* Why Study at UNS */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">Why Study at UNS?</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {whyUns.map((item, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100 hover:border-uns-gold transition-all">
                <div className="text-uns-gold mb-3 flex justify-center">{item.icon}</div>
                <h3 className="font-bold text-uns-navy mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Programs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">Available Programs</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">We offer 17 undergraduate programs across four academic areas. Explore all options before applying.</p>
          </div>
          <div className="text-center">
            <Link to="/academics" className="inline-flex items-center bg-uns-navy text-white px-8 py-4 rounded-md font-bold hover:bg-blue-900 transition-all">
              View All Programs <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">How to Apply</h2>
              <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
            </div>
            
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-5 p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-uns-navy text-uns-gold w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-uns-navy mb-1">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Online & Physical Learning */}
            <div className="mt-12 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-uns-navy mb-4">Learning Options</h3>
              <p className="text-gray-600 mb-6">
                UNS offers both physical (on-campus) and online learning options to accommodate different student needs and circumstances.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <CheckCircle2 size={20} className="text-uns-gold mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-uns-navy">On-Campus Learning</h4>
                    <p className="text-sm text-gray-600">Traditional classroom experience at our Garowe campus.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 size={20} className="text-uns-gold mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-uns-navy">Online Learning</h4>
                    <p className="text-sm text-gray-600">Flexible digital learning platform for remote students.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Admissions */}
      <section className="py-16 md:py-20 bg-uns-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Contact Admissions Office</h2>
            <p className="text-blue-100 mb-10 text-lg">
              Our admissions team is ready to assist you with any questions about programs, requirements, or the application process.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="tel:+0905265390" className="bg-white/10 p-8 rounded-xl hover:bg-white/20 transition-all flex flex-col items-center group">
                <div className="w-16 h-16 bg-uns-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Phone size={28} className="text-uns-navy" />
                </div>
                <h3 className="font-bold mb-2 text-lg">Call Us</h3>
                <p className="text-blue-100 text-lg">0905265390</p>
              </a>
              
              <a href="https://wa.me/0905265390" target="_blank" rel="noopener noreferrer" className="bg-white/10 p-8 rounded-xl hover:bg-white/20 transition-all flex flex-col items-center group">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle size={28} className="text-white" />
                </div>
                <h3 className="font-bold mb-2 text-lg">WhatsApp</h3>
                <p className="text-blue-100 text-lg">0905265390</p>
              </a>
              
              <a href="mailto:info@uns.edu.so" className="bg-white/10 p-8 rounded-xl hover:bg-white/20 transition-all flex flex-col items-center group">
                <div className="w-16 h-16 bg-uns-gold rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={28} className="text-uns-navy" />
                </div>
                <h3 className="font-bold mb-2 text-lg">Email Us</h3>
                <p className="text-blue-100 text-lg">info@uns.edu.so</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admissions;
