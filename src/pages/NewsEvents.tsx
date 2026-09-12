import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsEvents: React.FC = () => {
  const newsItems = [
    {
      title: 'Admissions Open for Fall 2026 Semester',
      date: 'August 2026',
      category: 'Admissions',
      author: 'Admissions Office',
      excerpt: 'Applications are now being accepted for all 17 undergraduate programs for the upcoming Fall 2026 semester. Contact the admissions office for details.',
      link: '/admissions',
    },
    {
      title: 'UNS Announces New Research Initiative',
      date: 'August 2026',
      category: 'Research',
      author: 'Academic Office',
      excerpt: 'The University of Northeastern Somalia is developing new research initiatives focusing on community-relevant challenges in the region.',
      link: '/research',
    },
    {
      title: 'Career Development Workshop Series',
      date: 'July 2026',
      category: 'Career Development',
      author: 'Career Office',
      excerpt: 'A series of career development workshops designed to help students and graduates develop professional skills and career readiness.',
      link: '/career',
    },
    {
      title: 'Student Life Activities at UNS',
      date: 'July 2026',
      category: 'Student Life',
      author: 'Student Affairs',
      excerpt: 'A look at the various student activities, clubs, and events taking place at the UNS campus in Garowe.',
      link: '/students',
    },
    {
      title: 'Online Learning Opportunities',
      date: 'June 2026',
      category: 'Academic News',
      author: 'Academic Office',
      excerpt: 'UNS continues to expand its online learning options to provide greater flexibility for students. Contact the Academic Office for available programs.',
      link: '/academics',
    },
    {
      title: 'International Collaboration Development',
      date: 'June 2026',
      category: 'International',
      author: 'University Administration',
      excerpt: 'UNS is actively working to develop international partnerships and collaborative opportunities for students and faculty.',
      link: '/international',
    },
  ];

  const categories = ['All', 'Admissions', 'Research', 'Career Development', 'Student Life', 'Academic News', 'International'];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">News & Events</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Stay updated with the latest happenings, academic updates, and upcoming events at UNS.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item, index) => (
              <Link 
                to={item.link} 
                key={index} 
                className="group flex flex-col h-full border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="bg-uns-gold text-uns-navy text-xs font-bold px-2 py-1 rounded">{item.category}</span>
                    <span className="text-gray-500 text-xs flex items-center">
                      <Calendar size={12} className="mr-1" /> {item.date}
                    </span>
                  </div>
                  
                  <h2 className="text-lg font-bold text-uns-navy mb-3 group-hover:text-uns-gold transition-colors leading-tight">
                    {item.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {item.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs flex items-center">
                      <User size={12} className="mr-1" /> {item.author}
                    </span>
                    <span className="text-uns-navy font-bold text-xs flex items-center group-hover:text-uns-gold transition-colors">
                      Read More <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-uns-navy mb-4">Stay Connected with UNS</h2>
          <p className="text-gray-600 mb-6">Follow us on social media or contact us for the latest updates.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:+252905265390" className="bg-uns-navy text-white px-6 py-3 rounded-md font-bold text-sm hover:bg-blue-900 transition-all">
              Call: 0905265390
            </a>
            <a href="https://wa.me/252905265390" target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-6 py-3 rounded-md font-bold text-sm hover:bg-green-700 transition-all">
              WhatsApp Us
            </a>
            <a href="mailto:info@uns.edu.so" className="border-2 border-uns-navy text-uns-navy px-6 py-3 rounded-md font-bold text-sm hover:bg-uns-navy hover:text-white transition-all">
              Email: info@uns.edu.so
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsEvents;
