import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Heart, Cpu, ArrowRight } from 'lucide-react';

const Academics: React.FC = () => {
  const academicAreas = [
    {
      title: 'SOCIAL SCIENCES & HUMANITIES',
      icon: <BookOpen size={28} />,
      color: 'bg-blue-50 text-blue-800',
      programs: [
        { name: 'Bachelor of Social Work', desc: 'Prepare for a career in social service and community support.', slug: 'bachelor-of-social-work' },
        { name: 'Bachelor of Psychology – Human & Family Development', desc: 'Study human behavior and family dynamics.', slug: 'bachelor-of-psychology' },
        { name: 'Bachelor of Early Childhood Education', desc: 'Focus on the development and education of young children.', slug: 'bachelor-of-early-childhood-education' },
        { name: 'Bachelor of Development Economics', desc: 'With an emphasis on policy research and economic development.', slug: 'bachelor-of-development-economics' },
        { name: 'Bachelor of Public Administration', desc: 'Develop skills for leadership in public and non-profit sectors.', slug: 'bachelor-of-public-administration' },
        { name: 'Bachelor of Political Science', desc: 'With an emphasis on policy research and political systems.', slug: 'bachelor-of-political-science' },
      ]
    },
    {
      title: 'BUSINESS & LEADERSHIP',
      icon: <Shield size={28} />,
      color: 'bg-amber-50 text-amber-800',
      programs: [
        { name: 'Bachelor of Business Management & Leadership', desc: 'Master the fundamentals of business and organizational leadership.', slug: 'bachelor-of-business-management' },
        { name: 'Bachelor of Accounting', desc: 'Develop expertise in financial reporting, auditing, and taxation.', slug: 'bachelor-of-accounting' },
        { name: 'Bachelor of Business Analytics', desc: 'Learn to use data to drive business decisions and strategy.', slug: 'bachelor-of-business-analytics' },
      ]
    },
    {
      title: 'HEALTH SCIENCES',
      icon: <Heart size={28} />,
      color: 'bg-red-50 text-red-800',
      programs: [
        { name: 'Bachelor of Nursing', desc: 'Comprehensive training for professional nursing practice.', slug: 'bachelor-of-nursing' },
        { name: 'Bachelor of Midwifery', desc: 'Specialized education for maternal and newborn care.', slug: 'bachelor-of-midwifery' },
        { name: 'Bachelor of Laboratory', desc: 'Training in medical laboratory science and diagnostics.', slug: 'bachelor-of-laboratory' },
        { name: 'Bachelor of Public Health', desc: 'Focus on community health, disease prevention, and health policy.', slug: 'bachelor-of-public-health' },
      ]
    },
    {
      title: 'TECHNOLOGY & DATA SCIENCE',
      icon: <Cpu size={28} />,
      color: 'bg-purple-50 text-purple-800',
      programs: [
        { name: 'Bachelor of Artificial Intelligence & Software Engineering', desc: 'Cutting-edge education in AI and software development.', slug: 'bachelor-of-ai-software-engineering' },
        { name: 'Bachelor of Data Analytics & Decision Science', desc: 'Master the tools and techniques of data-driven decision making.', slug: 'bachelor-of-data-analytics' },
        { name: 'Bachelor of Cybersecurity', desc: 'Learn to protect systems and data from digital threats.', slug: 'bachelor-of-cybersecurity' },
        { name: 'Bachelor of Software Systems & AI Engineering', desc: 'Advanced study of software systems and AI integration.', slug: 'bachelor-of-software-systems' },
      ]
    }
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Academic Programs</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            UNS offers 17 undergraduate programs across four key academic areas, designed to prepare you for professional success and community impact.
          </p>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 md:space-y-20">
            {academicAreas.map((area, areaIndex) => (
              <div key={areaIndex} className="scroll-mt-24" id={area.title.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-')}>
                <div className="flex items-center space-x-4 mb-8 md:mb-10 border-b-2 border-gray-100 pb-6">
                  <div className="bg-uns-navy text-uns-gold p-3 rounded-lg">
                    {area.icon}
                  </div>
                  <h2 className="text-xl md:text-3xl font-bold text-uns-navy uppercase tracking-wide">{area.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {area.programs.map((program, progIndex) => (
                    <Link 
                      to={`/academics/${program.slug}`} 
                      key={progIndex} 
                      className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-200 hover:border-uns-gold hover:shadow-lg transition-all flex flex-col h-full group"
                    >
                      <h3 className="text-lg font-bold text-uns-navy mb-3 group-hover:text-uns-gold transition-colors">{program.name}</h3>
                      <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">{program.desc}</p>
                      <div className="flex items-center text-uns-navy text-sm font-bold group-hover:text-uns-gold transition-colors">
                        View Program Details <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Options */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-uns-navy mb-4">Flexible Learning at UNS</h2>
              <div className="w-20 h-1.5 bg-uns-gold mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-uns-navy mb-4">On-Campus Learning</h3>
                <p className="text-gray-600 leading-relaxed">Study at the University of Northeastern Somalia campus in Garowe, Puntland and participate in a university-based academic environment with access to all campus facilities.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-uns-navy mb-4">Online Learning</h3>
                <p className="text-gray-600 leading-relaxed">Access selected courses and learning opportunities through online delivery, providing greater flexibility for students.</p>
              </div>
            </div>
            <p className="mt-8 text-gray-500 italic text-sm text-center">Note: Not all academic programs are available online. Contact the Academic Office for specific program availability.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-uns-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-blue-100 mb-6">Start your application or contact us for more information.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/admissions" className="bg-uns-gold text-uns-navy px-8 py-3 rounded-md font-bold hover:bg-yellow-400 transition-all">
              Apply Now
            </Link>
            <a href="tel:+252905265390" className="border border-white text-white px-8 py-3 rounded-md font-bold hover:bg-white hover:text-uns-navy transition-all">
              Contact Admissions: 0905265390
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Academics;
