import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Users, BookOpen, Award, ArrowRight, Handshake, GraduationCap, Mail, Phone } from 'lucide-react';

const International: React.FC = () => {
  const opportunities = [
    { title: 'International Collaboration', desc: 'Building academic partnerships with institutions worldwide to enhance educational quality and research capacity.', icon: <Handshake size={28} /> },
    { title: 'Student Exchange', desc: 'Opportunities for UNS students to study abroad and gain international academic experience.', icon: <GraduationCap size={28} /> },
    { title: 'Faculty Exchange', desc: 'Programs enabling UNS faculty members to collaborate with international counterparts.', icon: <Users size={28} /> },
    { title: 'Visiting Lecturers', desc: 'Inviting international scholars and experts to contribute to UNS academic programs.', icon: <BookOpen size={28} /> },
    { title: 'International Students', desc: 'Welcoming students from around the world to study at UNS in Garowe.', icon: <Globe size={28} /> },
    { title: 'Online International Programs', desc: 'Select online learning opportunities connecting UNS with international academic communities.', icon: <Award size={28} /> },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">International</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            UNS is building its international presence through collaborative partnerships, exchange programs, and global academic engagement.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-uns-navy mb-6">Global Engagement</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto mb-8"></div>
            <p className="text-gray-600 text-lg leading-relaxed">
              The University of Northeastern Somalia is committed to developing international connections that enhance academic quality, broaden student horizons, and contribute to regional knowledge exchange. While building these partnerships, we focus on creating meaningful opportunities for our students and faculty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((opp, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:border-uns-gold hover:shadow-lg transition-all">
                <div className="bg-uns-navy text-uns-gold w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  {opp.icon}
                </div>
                <h3 className="text-xl font-bold text-uns-navy mb-3">{opp.title}</h3>
                <p className="text-gray-600 leading-relaxed">{opp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarships & Research */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-uns-navy mb-6">Scholarships</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                UNS is working to establish scholarship opportunities for deserving students, including international applicants. As these programs develop, they will be announced through our admissions channels.
              </p>
              <p className="text-gray-500 italic text-sm">
                Scholarship details will be updated as they become available.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-uns-navy mb-6">Research Collaboration</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                UNS seeks to develop international research collaborations that address regional challenges in public health, technology, education, and economic development.
              </p>
              <Link to="/research" className="inline-flex items-center text-uns-navy font-bold hover:text-uns-gold transition-colors">
                View Research Areas <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-uns-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Interested in International Opportunities?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Contact us to learn more about developing partnerships and international programs at UNS.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:info@uns.edu.so" className="bg-uns-gold text-uns-navy px-8 py-4 rounded-md font-bold hover:bg-yellow-400 transition-all inline-flex items-center justify-center">
              <Mail size={18} className="mr-2" />
              Email Us
            </a>
            <a href="tel:+252905265390" className="border border-white text-white px-8 py-4 rounded-md font-bold hover:bg-white hover:text-uns-navy transition-all inline-flex items-center justify-center">
              <Phone size={18} className="mr-2" />
              0905265390
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default International;
