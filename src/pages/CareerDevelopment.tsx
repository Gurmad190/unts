import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Lightbulb, TrendingUp, Users, Award, CheckCircle2, Phone, Mail } from 'lucide-react';

const CareerDevelopment: React.FC = () => {
  const services = [
    'Career Guidance & Counseling',
    'CV & Résumé Preparation',
    'Interview Skills Training',
    'Professional Skills Workshops',
    'Internship Placement Support',
    'Employer Connections & Networking',
    'Job Search Strategies',
    'Entrepreneurship Support',
    'Professional Development Events',
    'Graduate Engagement Programs',
  ];

  const readinessAreas = [
    { title: 'Communication', icon: <Users size={24} /> },
    { title: 'Leadership', icon: <Award size={24} /> },
    { title: 'Digital Skills', icon: <TrendingUp size={24} /> },
    { title: 'Problem Solving', icon: <Lightbulb size={24} /> },
    { title: 'Teamwork', icon: <Users size={24} /> },
    { title: 'Professional Ethics', icon: <Briefcase size={24} /> },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Graduate Career Development</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            UNS supports students and graduates in developing the knowledge, professional skills, and career readiness needed for success in the professional world.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-8">Career Services</h2>
              <div className="grid grid-cols-1 gap-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <CheckCircle2 className="text-uns-gold flex-shrink-0" size={18} />
                    <span className="text-gray-700 text-sm font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-uns-navy text-white p-10 rounded-2xl">
                <h3 className="text-2xl font-bold mb-6 text-uns-gold">Our Commitment</h3>
                <p className="text-blue-100 leading-relaxed mb-8">
                  UNS is dedicated to bridging the gap between education and employment, ensuring our graduates are not just degree holders, but professional leaders ready to contribute to their communities and the broader economy.
                </p>
                <div className="space-y-4">
                  <Link to="/admissions" className="block bg-uns-gold text-uns-navy text-center py-3 rounded-md font-bold hover:bg-yellow-400 transition-all">
                    Apply to UNS
                  </Link>
                  <a href="tel:+252905265390" className="block border border-white text-white text-center py-3 rounded-md font-bold hover:bg-white hover:text-uns-navy transition-all">
                    Contact: 0905265390
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Readiness */}
      <section className="py-16 bg-uns-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Career Readiness Areas</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">We focus on six key areas to ensure our graduates are prepared for the professional world.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {readinessAreas.map((area, index) => (
              <div key={index} className="text-center p-5 bg-blue-900/50 rounded-xl border border-blue-800 hover:border-uns-gold transition-all">
                <div className="text-uns-gold mb-3 flex justify-center">
                  {area.icon}
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider">{area.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Graduate Opportunities */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">Graduate Opportunities</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: 'Jobs', icon: <Briefcase size={22} /> },
              { title: 'Internships', icon: <Users size={22} /> },
              { title: 'Entrepreneurship', icon: <Lightbulb size={22} /> },
              { title: 'Further Education', icon: <GraduationCap size={22} /> },
              { title: 'Professional Development', icon: <Award size={22} /> },
            ].map((opp, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-md transition-all">
                <div className="text-uns-navy mb-3 flex justify-center">{opp.icon}</div>
                <h3 className="text-sm font-bold text-uns-navy">{opp.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-uns-navy mb-4">Get Career Support</h2>
          <p className="text-gray-600 mb-6">Contact us to learn about career development services available to UNS students and graduates.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:+252905265390" className="bg-uns-navy text-white px-8 py-3 rounded-md font-bold hover:bg-blue-900 transition-all inline-flex items-center justify-center">
              <Phone size={16} className="mr-2" />
              0905265390
            </a>
            <a href="mailto:info@uns.edu.so" className="border-2 border-uns-navy text-uns-navy px-8 py-3 rounded-md font-bold hover:bg-uns-navy hover:text-white transition-all inline-flex items-center justify-center">
              <Mail size={16} className="mr-2" />
              info@uns.edu.so
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerDevelopment;
