import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Globe, Award, ArrowRight, Calendar, Phone, Mail } from 'lucide-react';
import { listAnnouncements, getBranding, type Announcement, type BrandingSettings } from '../lib/portalApi';

const Home: React.FC = () => {
  const featuredPrograms = [
    {
      title: 'Artificial Intelligence & Software Engineering',
      description: 'Prepare for the future of technology with our comprehensive AI and software engineering program.',
      category: 'Technology & Data Science',
      slug: 'bachelor-of-ai-software-engineering',
    },
    {
      title: 'Business Management & Leadership',
      description: 'Master the fundamentals of business operations and develop organizational leadership skills.',
      category: 'Business & Leadership',
      slug: 'bachelor-of-business-management',
    },
    {
      title: 'Nursing',
      description: 'Join a critical healthcare profession with our rigorous clinical and theoretical nursing program.',
      category: 'Health Sciences',
      slug: 'bachelor-of-nursing',
    },
    {
      title: 'Public Administration',
      description: 'Develop the leadership skills needed to serve in public institutions and drive community impact.',
      category: 'Social Sciences & Humanities',
      slug: 'bachelor-of-public-administration',
    },
  ];

  const [latestNews, setLatestNews] = useState<Announcement[]>([]);
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    void getBranding().then(setBranding).catch(() => undefined);
  }, []);

  useEffect(() => {
    listAnnouncements()
      .then((items) => setLatestNews(items.slice(0, 3)))
      .catch(() => setLatestNews([]))
      .finally(() => setNewsLoading(false));
  }, []);


  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[550px] md:min-h-[600px] flex items-center overflow-hidden bg-uns-navy">
        <div className="absolute inset-0 z-0">
          <img 
            src="/aigc-images/uns-hero-campus_1788020145_000.png" 
            alt="UNS Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-uns-navy via-uns-navy/90 to-uns-navy/70"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white py-16">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-4 mb-6">
              <img src={branding?.logo_url || "/uns-logo.jpg"} alt={`${branding?.university_name || 'UNS'} Logo`} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-uns-gold" />
              <div>
                <p className="text-uns-gold font-bold text-sm uppercase tracking-widest">{branding?.university_name || 'University of Northeastern Somalia'}</p>
                <p className="text-blue-200 text-xs mt-1">Great Minds Build Nations</p>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight font-display">
              Knowledge • Innovation • Service
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed max-w-2xl">
              A university committed to quality education, research, professional development, and meaningful community impact in Garowe, Puntland, Somalia.
            </p>
            <p className="text-sm md:text-base font-semibold mb-8 text-uns-gold">
              Study On Campus in Garowe or Access Selected Learning Opportunities Online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/apply" className="bg-uns-gold text-uns-navy px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-all text-center">
                Apply Online
              </Link>
              <Link to="/academics" className="border-2 border-white text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-white hover:text-uns-navy transition-all text-center">
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-12 md:py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <Link to="/academics" className="text-center p-5 md:p-6 border-b-4 border-uns-gold bg-gray-50 rounded-lg hover:shadow-md transition-all">
              <BookOpen className="mx-auto text-uns-navy mb-3" size={36} />
              <h3 className="text-2xl md:text-3xl font-bold text-uns-navy mb-1">17</h3>
              <p className="text-gray-600 font-medium text-sm">Undergraduate Programs</p>
            </Link>
            <Link to="/academics" className="text-center p-5 md:p-6 border-b-4 border-uns-gold bg-gray-50 rounded-lg hover:shadow-md transition-all">
              <Users className="mx-auto text-uns-navy mb-3" size={36} />
              <h3 className="text-2xl md:text-3xl font-bold text-uns-navy mb-1">4</h3>
              <p className="text-gray-600 font-medium text-sm">Academic Areas</p>
            </Link>
            <div className="text-center p-5 md:p-6 border-b-4 border-uns-gold bg-gray-50 rounded-lg">
              <Globe className="mx-auto text-uns-navy mb-3" size={36} />
              <h3 className="text-lg md:text-xl font-bold text-uns-navy mb-1">On-Campus</h3>
              <p className="text-gray-600 font-medium text-sm">Learning in Garowe</p>
            </div>
            <Link to="/students" className="text-center p-5 md:p-6 border-b-4 border-uns-gold bg-gray-50 rounded-lg hover:shadow-md transition-all">
              <Award className="mx-auto text-uns-navy mb-3" size={36} />
              <h3 className="text-lg md:text-xl font-bold text-uns-navy mb-1">Online</h3>
              <p className="text-gray-600 font-medium text-sm">Learning Opportunities</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Programs */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-uns-navy mb-3">Academic Programs</h2>
              <div className="w-20 h-1.5 bg-uns-gold"></div>
            </div>
            <Link to="/academics" className="hidden md:flex items-center text-uns-navy font-bold hover:text-uns-gold transition-colors text-sm">
              View All Programs <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPrograms.map((program, index) => (
              <Link to={`/academics/${program.slug}`} key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-uns-gold transition-all group">
                <span className="text-xs font-bold text-uns-gold uppercase tracking-wider mb-2 block">{program.category}</span>
                <h3 className="text-lg md:text-xl font-bold text-uns-navy mb-2 group-hover:text-uns-gold transition-colors">{program.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{program.description}</p>
                <span className="text-uns-navy font-bold text-sm flex items-center group-hover:text-uns-gold transition-colors">
                  Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link to="/academics" className="inline-flex items-center bg-uns-navy text-white px-6 py-3 rounded-md font-bold text-sm">
              View All Programs <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Flexible Learning */}
      <section className="py-16 md:py-20 bg-uns-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Flexible Learning at UNS</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-900/50 p-8 rounded-xl border border-blue-800">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-uns-gold p-3 rounded-full text-uns-navy">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold">On-Campus Learning</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Study at the UNS campus in Garowe, Puntland and participate in a university-based academic environment with access to all campus facilities and student services.
              </p>
            </div>
            <div className="bg-blue-900/50 p-8 rounded-xl border border-blue-800">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-uns-gold p-3 rounded-full text-uns-navy">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold">Online Learning</h3>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Access selected courses and learning opportunities through online delivery, providing greater flexibility for students. Not all programs are available online.
              </p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link to="/academics" className="inline-block bg-uns-gold text-uns-navy px-8 py-4 rounded-md font-bold hover:bg-yellow-400 transition-all">
              Explore All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Why UNS */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-uns-navy mb-3">Why Choose UNS?</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Quality Education', desc: 'Dedicated faculty committed to academic excellence across 17 undergraduate programs.' },
              { title: 'Flexible Learning', desc: 'Both on-campus and online learning options to suit diverse student needs.' },
              { title: 'Career Development', desc: 'Comprehensive career support from guidance to job placement.' },
            ].map((item, index) => (
              <div key={index} className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-lg font-bold text-uns-navy mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Teaser */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-uns-navy mb-3">News & Updates</h2>
              <div className="w-20 h-1.5 bg-uns-gold"></div>
            </div>
            <Link to="/news" className="hidden md:flex items-center text-uns-navy font-bold hover:text-uns-gold transition-colors text-sm">
              View All News <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsLoading ? [1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl bg-white" />) : latestNews.length === 0 ? <div className="md:col-span-3 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center"><p className="font-semibold text-uns-navy">News and updates are coming soon.</p><p className="mt-2 text-sm text-gray-600">Visit this page again for the latest University announcements.</p></div> : latestNews.map((news) => (
              <article key={news.id} className="group rounded-xl border border-gray-100 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-uns-gold text-uns-navy text-xs font-bold px-2 py-1 rounded capitalize">{news.content_type}</span>
                  <span className="text-gray-500 text-xs flex items-center">
                    <Calendar size={12} className="mr-1" /> {news.published_at ? new Date(news.published_at).toLocaleDateString() : 'Recently published'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-uns-navy group-hover:text-uns-gold transition-colors leading-tight">{news.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{news.summary || news.body}</p>
              </article>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/news" className="inline-flex items-center text-uns-navy font-bold text-sm">
              View All News <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-uns-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Start Your Academic Journey Today</h2>
          <p className="text-blue-100 text-lg mb-8">
            Join a community of scholars, innovators, and leaders at the University of Northeastern Somalia.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/apply" className="bg-uns-gold text-uns-navy px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-all">
              Apply Online
            </Link>
            <a href="tel:+0905265390" className="border border-white text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-white hover:text-uns-navy transition-all inline-flex items-center justify-center">
              <Phone size={18} className="mr-2" />
              Call Admissions
            </a>
          </div>
          <div className="mt-4">
            <a href="mailto:info@uns.edu.so" className="text-blue-200 hover:text-white transition-colors text-sm inline-flex items-center">
              <Mail size={14} className="mr-1" />
              info@uns.edu.so
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
