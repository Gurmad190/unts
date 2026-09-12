import React from 'react';
import { Search, Book, Users, Globe, FileText, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Research: React.FC = () => {
  const researchAreas = [
    'Social Sciences',
    'Public Policy & Governance',
    'Economics & Development',
    'Education',
    'Public Health',
    'Business & Management',
    'Technology & Data Science',
    'Community Development',
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Research & Innovation</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            UNS promotes research and knowledge development addressing important social, economic, educational, health, policy, and technological challenges.
          </p>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">Research Areas</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {researchAreas.map((area, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-100 text-center hover:bg-uns-navy hover:text-white transition-all group cursor-default">
                <h3 className="font-bold text-uns-navy group-hover:text-uns-gold text-sm">{area}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Activities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">Research Activities</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Research Projects', icon: <Search size={24} />, desc: 'Ongoing initiatives addressing local and regional challenges in collaboration with community partners.' },
              { title: 'Faculty Research', icon: <FileText size={24} />, desc: 'Individual and collaborative research by UNS faculty members across various disciplines.' },
              { title: 'Student Research', icon: <Users size={24} />, desc: 'Undergraduate research projects, thesis work, and student-led investigations.' },
              { title: 'Research Seminars', icon: <Calendar size={24} />, desc: 'Regular academic discussions, presentations, and knowledge-sharing events.' },
              { title: 'Conferences', icon: <Globe size={24} />, desc: 'Academic gatherings bringing together experts to share knowledge and findings.' },
              { title: 'Publications', icon: <Book size={24} />, desc: 'Scholarly works published by our faculty and researchers in academic journals.' },
            ].map((activity, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-uns-gold mb-4">{activity.icon}</div>
                <h3 className="text-lg font-bold text-uns-navy mb-2">{activity.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{activity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Opportunities */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100">
              <h3 className="text-2xl font-bold text-uns-navy mb-6">International Research Collaboration</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                UNS seeks to develop international research collaborations that address regional challenges. We are working to establish partnerships with institutions worldwide.
              </p>
              <Link to="/international" className="inline-flex items-center text-uns-navy font-bold hover:text-uns-gold transition-colors text-sm">
                View International Opportunities <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100">
              <h3 className="text-2xl font-bold text-uns-navy mb-6">Get Involved in Research</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Students and faculty interested in research opportunities are encouraged to contact the Academic Office to learn more about ongoing projects and how to participate.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="mailto:Ashkir@uns.edu.so" className="inline-flex items-center bg-uns-navy text-white px-5 py-2.5 rounded-md font-bold text-sm hover:bg-blue-900 transition-all">
                  Contact Research Office
                </a>
                <Link to="/contact" className="inline-flex items-center border-2 border-uns-navy text-uns-navy px-5 py-2.5 rounded-md font-bold text-sm hover:bg-uns-navy hover:text-white transition-all">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-uns-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Interested in Research at UNS?</h2>
          <p className="text-blue-100 mb-6">Contact us to learn more about research opportunities and collaborations.</p>
          <a href="mailto:Ashkir@uns.edu.so" className="inline-flex items-center bg-uns-gold text-uns-navy px-8 py-3 rounded-md font-bold hover:bg-yellow-400 transition-all">
            <span className="mr-2">✉</span> Contact Research Office
          </a>
        </div>
      </section>
    </div>
  );
};

export default Research;
