import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Heart, Briefcase, Globe, Award, GraduationCap, ArrowRight, Phone, Mail } from 'lucide-react';

const Students: React.FC = () => {
  const supportServices = [
    { title: 'Academic Support', desc: 'Access tutoring, study groups, and academic advising to help you succeed in your coursework.', icon: <BookOpen size={24} /> },
    { title: 'Student Counseling', desc: 'Confidential support for personal and academic challenges during your university journey.', icon: <Heart size={24} /> },
    { title: 'Career Guidance', desc: 'Professional career counseling, CV preparation, and job placement support.', icon: <Briefcase size={24} /> },
    { title: 'Library Services', desc: 'Access to academic resources, research materials, and digital databases.', icon: <Globe size={24} /> },
  ];

  const activities = [
    'Academic Seminars & Workshops',
    'Student Government & Leadership',
    'Community Service Programs',
    'Cultural Events & Celebrations',
    'Sports & Recreation',
    'Professional Development Events',
    'Guest Lectures',
    'Student Research Presentations',
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Student Experience</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            UNS provides a supportive and enriching environment where students can grow academically, socially, and professionally.
          </p>
        </div>
      </section>

      {/* Student Life */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-uns-navy mb-4">Student Life at UNS</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
                <img 
                  src="/aigc-images/uns-students-learning_1788020153_000.png" 
                  alt="Students learning at UNS" 
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                At the University of Northeastern Somalia, student life extends beyond the classroom. We foster a vibrant campus community where students engage in activities that develop leadership, critical thinking, and professional skills.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Award size={16} className="text-uns-gold flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-uns-navy text-white p-10 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6 text-uns-gold">Why Students Choose UNS</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <GraduationCap size={20} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>17 undergraduate programs across 4 academic areas</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Users size={20} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>Dedicated faculty and supportive learning environment</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Globe size={20} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>Both on-campus and online learning options</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Briefcase size={20} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>Graduate career development support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Student Support */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-uns-navy mb-4">Student Support Services</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportServices.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-lg transition-all">
                <div className="bg-uns-navy text-uns-gold w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-uns-navy mb-3">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Online Learning */}
      <section className="py-20 bg-uns-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Online Learning</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                UNS provides both physical on-campus education and online learning options. Students can access selected courses and learning materials online, providing greater flexibility.
              </p>
              <p className="text-blue-100 mb-8">
                Not all academic programs are available online. Contact the Academic Office for specific program availability.
              </p>
              <Link to="/academics" className="inline-block bg-uns-gold text-uns-navy px-8 py-4 rounded-md font-bold hover:bg-yellow-400 transition-all">
                View Programs
              </Link>
            </div>
            <div className="bg-blue-900/50 p-10 rounded-2xl border border-blue-800">
              <h3 className="text-xl font-bold text-uns-gold mb-6">Training & Development</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-blue-100">
                  <Award size={18} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>Professional skills development workshops</span>
                </li>
                <li className="flex items-start space-x-3 text-blue-100">
                  <Award size={18} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>Technology and digital literacy training</span>
                </li>
                <li className="flex items-start space-x-3 text-blue-100">
                  <Award size={18} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>Leadership and entrepreneurship programs</span>
                </li>
                <li className="flex items-start space-x-3 text-blue-100">
                  <Award size={18} className="text-uns-gold mt-0.5 flex-shrink-0" />
                  <span>Community engagement opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-uns-navy mb-6">Student Enquiries</h2>
          <p className="text-gray-600 text-lg mb-8">Have questions about student life, support services, or programs? We're here to help.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:+252905265390" className="bg-uns-navy text-white px-8 py-4 rounded-md font-bold hover:bg-blue-900 transition-all inline-flex items-center justify-center">
              <Phone size={18} className="mr-2" />
              0905265390
            </a>
            <a href="mailto:info@uns.edu.so" className="border-2 border-uns-navy text-uns-navy px-8 py-4 rounded-md font-bold hover:bg-uns-navy hover:text-white transition-all inline-flex items-center justify-center">
              <Mail size={18} className="mr-2" />
              info@uns.edu.so
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Students;
