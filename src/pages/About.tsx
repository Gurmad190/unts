import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, ShieldCheck, HeartHandshake, Phone, Mail } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    { title: 'Excellence', icon: <Target size={28} />, desc: 'We strive for the highest standards in education and research.' },
    { title: 'Integrity', icon: <ShieldCheck size={28} />, desc: 'We maintain honesty and strong moral principles in all our actions.' },
    { title: 'Innovation', icon: <Eye size={28} />, desc: 'We embrace new ideas and technologies to solve complex challenges.' },
    { title: 'Service', icon: <HeartHandshake size={28} />, desc: 'We are dedicated to serving our community and society.' },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">About UNS</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            The University of Northeastern Somalia (UNS) is a higher education institution based in Garowe, Puntland, Somalia.
          </p>
        </div>
      </section>
      {/* Overview */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-6">Our Commitment</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                The University of Northeastern Somalia (UNS) is committed to education, research, professional development, and community service. We provide a supportive environment where students can grow academically and professionally.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Based in the heart of Garowe, we serve as a hub for knowledge and innovation, preparing the next generation of leaders for Somalia and the wider region.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/admissions" className="bg-uns-navy text-white px-6 py-3 rounded-md font-bold text-sm hover:bg-blue-900 transition-all text-center">
                  Apply Now
                </Link>
                <a href="tel:+252905265390" className="border-2 border-uns-navy text-uns-navy px-6 py-3 rounded-md font-bold text-sm hover:bg-uns-navy hover:text-white transition-all text-center">
                  Contact Us
                </a>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="/aigc-images/uns-tech-research_1788020162_000.png" 
                alt="UNS Research" 
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Vision & Mission */}
      <section className="py-16 md:py-20 bg-uns-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Vision & Mission</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-blue-900/50 p-8 rounded-2xl border border-blue-800">
              <h3 className="text-xl font-bold text-uns-gold mb-4 flex items-center">
                <Eye className="mr-3" size={24} /> Vision
              </h3>
              <p className="text-lg leading-relaxed text-blue-100">To become a leading center of knowledge, innovation, and professional development in Somalia and beyond.</p>
            </div>
            <div className="bg-blue-900/50 p-8 rounded-2xl border border-blue-800">
              <h3 className="text-xl font-bold text-uns-gold mb-4 flex items-center">
                <Target className="mr-3" size={24} /> Mission
              </h3>
              <p className="text-lg leading-relaxed text-blue-100">
                To provide quality education, promote relevant research, and prepare graduates to contribute effectively to society.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Core Values */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">Our Core Values</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl text-center border border-gray-100 hover:border-uns-gold transition-all">
                <div className="text-uns-gold mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-lg font-bold text-uns-navy mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Key Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">At a Glance</h2>
            <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: '17', label: 'Undergraduate Programs' },
              { number: '4', label: 'Academic Areas' },
              { number: '2', label: 'Learning Modes' },
              { number: '1', label: 'Campus in Garowe' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl border border-gray-100">
                <p className="text-3xl font-bold text-uns-gold mb-2">{stat.number}</p>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Contact CTA */}
      <section className="py-12 bg-uns-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Learn More About UNS</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:+252905265390" className="bg-uns-gold text-uns-navy px-8 py-3 rounded-md font-bold hover:bg-yellow-400 transition-all inline-flex items-center justify-center">
              <Phone size={16} className="mr-2" />
              0905265390
            </a>
            <a href="mailto:info@uns.edu.so" className="border border-white text-white px-8 py-3 rounded-md font-bold hover:bg-white hover:text-uns-navy transition-all inline-flex items-center justify-center">
              <Mail size={16} className="mr-2" />
              info@uns.edu.so
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
