import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Briefcase, Target, Phone, Mail, CheckCircle2, GraduationCap, DollarSign, Award, FileText } from 'lucide-react';

interface ProgramData {
  title: string;
  category: string;
  overview: string;
  keyAreas: string[];
  careers: string[];
}

const programsData: Record<string, ProgramData> = {
  'bachelor-of-social-work': {
    title: 'Bachelor of Social Work',
    category: 'Social Sciences & Humanities',
    overview: 'The Bachelor of Social Work program prepares students for professional practice in social service and community support. Students develop skills in social welfare, community development, and advocacy for individuals and families in need.',
    keyAreas: ['Social Welfare Systems', 'Community Development', 'Case Management', 'Family Support Services', 'Social Policy & Advocacy', 'Research Methods in Social Work'],
    careers: ['Social Worker', 'Community Development Officer', 'Case Manager', 'Child Welfare Specialist', 'Non-Governmental Organization Worker', 'Policy Advocate'],
  },
  'bachelor-of-psychology': {
    title: 'Bachelor of Psychology – Human & Family Development',
    category: 'Social Sciences & Humanities',
    overview: 'This program explores human behavior, cognitive processes, and family dynamics. Students gain a deep understanding of psychological theories and their application to human development and family well-being.',
    keyAreas: ['Developmental Psychology', 'Family Dynamics', 'Cognitive Psychology', 'Behavioral Analysis', 'Mental Health & Well-being', 'Research in Psychology'],
    careers: ['Counselor', 'Human Services Specialist', 'Family Therapist Assistant', 'Community Support Worker', 'Research Assistant', 'Youth Development Worker'],
  },
  'bachelor-of-early-childhood-education': {
    title: 'Bachelor of Early Childhood Education',
    category: 'Social Sciences & Humanities',
    overview: 'Focused on the development and education of young children, this program equips graduates with the knowledge and skills to create effective learning environments for children in their formative years.',
    keyAreas: ['Child Development', 'Early Literacy & Numeracy', 'Play-Based Learning', 'Curriculum Design for Young Learners', 'Inclusive Education', 'Parent & Community Engagement'],
    careers: ['Early Childhood Educator', 'Preschool Teacher', 'Childcare Center Director', 'Educational Consultant', 'Curriculum Developer', 'Family Education Specialist'],
  },
  'bachelor-of-development-economics': {
    title: 'Bachelor of Development Economics',
    category: 'Social Sciences & Humanities',
    overview: 'This program combines economic theory with practical applications focused on development challenges. Students learn to analyze policy research and contribute to economic development in developing regions.',
    keyAreas: ['Microeconomics & Macroeconomics', 'Development Policy', 'Poverty Analysis', 'Resource Economics', 'Public Finance', 'Quantitative Research Methods'],
    careers: ['Development Economist', 'Policy Analyst', 'Research Officer', 'International Development Worker', 'Economic Consultant', 'Government Economic Advisor'],
  },
  'bachelor-of-public-administration': {
    title: 'Bachelor of Public Administration',
    category: 'Social Sciences & Humanities',
    overview: 'Designed for future leaders in public and non-profit sectors, this program develops skills in governance, public policy, and organizational management within public institutions.',
    keyAreas: ['Public Policy', 'Governance & Administration', 'Organizational Management', 'Public Finance Management', 'Leadership in Public Sector', 'Ethics in Governance'],
    careers: ['Public Administrator', 'Government Officer', 'Policy Analyst', 'Non-Profit Manager', 'Program Coordinator', 'Municipal Officer'],
  },
  'bachelor-of-political-science': {
    title: 'Bachelor of Political Science',
    category: 'Social Sciences & Humanities',
    overview: 'With an emphasis on policy research and political systems, this program examines governance, international relations, and the political forces shaping societies.',
    keyAreas: ['Political Theory', 'Comparative Politics', 'International Relations', 'Public Policy Analysis', 'Conflict & Peace Studies', 'Research Methods'],
    careers: ['Political Analyst', 'Diplomat', 'Policy Researcher', 'Journalist', 'NGO Program Manager', 'Government Relations Specialist'],
  },
  'bachelor-of-business-management': {
    title: 'Bachelor of Business Management & Leadership',
    category: 'Business & Leadership',
    overview: 'Master the fundamentals of business operations and organizational leadership. This program prepares students for management roles across various sectors.',
    keyAreas: ['Strategic Management', 'Organizational Leadership', 'Marketing Management', 'Human Resource Management', 'Entrepreneurship', 'Business Ethics'],
    careers: ['Business Manager', 'Operations Manager', 'Entrepreneur', 'Management Consultant', 'Project Manager', 'Business Analyst'],
  },
  'bachelor-of-accounting': {
    title: 'Bachelor of Accounting',
    category: 'Business & Leadership',
    overview: 'Develop expertise in financial reporting, auditing, and taxation. This program prepares students for professional accounting careers and financial management.',
    keyAreas: ['Financial Accounting', 'Management Accounting', 'Auditing', 'Taxation', 'Corporate Finance', 'Accounting Information Systems'],
    careers: ['Accountant', 'Auditor', 'Financial Analyst', 'Tax Consultant', 'Financial Controller', 'Budget Analyst'],
  },
  'bachelor-of-business-analytics': {
    title: 'Bachelor of Business Analytics',
    category: 'Business & Leadership',
    overview: 'Learn to use data to drive business decisions and strategy. This program combines business knowledge with data analysis skills.',
    keyAreas: ['Data Mining', 'Business Intelligence', 'Predictive Analytics', 'Database Management', 'Data Visualization', 'Strategic Decision Making'],
    careers: ['Business Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Market Research Analyst', 'Operations Analyst', 'Strategy Consultant'],
  },
  'bachelor-of-nursing': {
    title: 'Bachelor of Nursing',
    category: 'Health Sciences',
    overview: 'Comprehensive training for professional nursing practice. Students learn to provide high-quality patient care across various healthcare settings.',
    keyAreas: ['Anatomy & Physiology', 'Clinical Nursing Practice', 'Pharmacology', 'Community Health Nursing', 'Pediatric Nursing', 'Medical-Surgical Nursing'],
    careers: ['Registered Nurse', 'Clinical Nurse Specialist', 'Public Health Nurse', 'Nurse Educator', 'Healthcare Administrator', 'Research Nurse'],
  },
  'bachelor-of-midwifery': {
    title: 'Bachelor of Midwifery',
    category: 'Health Sciences',
    overview: 'Specialized education for maternal and newborn care. This program prepares students to support women during pregnancy, childbirth, and the postpartum period.',
    keyAreas: ['Maternal Anatomy', 'Obstetric Complications', 'Neonatal Care', 'Reproductive Health', 'Midwifery Practice', 'Community Midwifery'],
    careers: ['Midwife', 'Maternal Health Specialist', 'Neonatal Care Provider', 'Family Planning Counselor', 'Health Educator', 'Clinical Supervisor'],
  },
  'bachelor-of-laboratory': {
    title: 'Bachelor of Laboratory',
    category: 'Health Sciences',
    overview: 'Training in medical laboratory science and diagnostics. Students learn to perform complex tests to help detect, diagnose, and treat diseases.',
    keyAreas: ['Clinical Chemistry', 'Hematology', 'Microbiology', 'Immunology', 'Molecular Diagnostics', 'Laboratory Management'],
    careers: ['Medical Laboratory Scientist', 'Clinical Pathologist', 'Research Technician', 'Quality Control Specialist', 'Public Health Lab Technician', 'Biomedical Researcher'],
  },
  'bachelor-of-public-health': {
    title: 'Bachelor of Public Health',
    category: 'Health Sciences',
    overview: 'Focus on community health, disease prevention, and health policy. This program prepares students to address health challenges at the population level.',
    keyAreas: ['Epidemiology', 'Biostatistics', 'Environmental Health', 'Health Policy & Management', 'Global Health', 'Health Promotion'],
    careers: ['Public Health Officer', 'Epidemiologist', 'Health Educator', 'Environmental Health Specialist', 'Health Policy Analyst', 'Community Health Coordinator'],
  },
  'bachelor-of-ai-software-engineering': {
    title: 'Bachelor of Artificial Intelligence & Software Engineering',
    category: 'Technology & Data Science',
    overview: 'Cutting-edge education in AI and software development. Students learn to design, build, and implement intelligent software systems.',
    keyAreas: ['Machine Learning', 'Software Architecture', 'Deep Learning', 'Natural Language Processing', 'Algorithms & Data Structures', 'Software Testing'],
    careers: ['AI Engineer', 'Software Developer', 'Machine Learning Engineer', 'Systems Architect', 'AI Researcher', 'Full Stack Developer'],
  },
  'bachelor-of-data-analytics': {
    title: 'Bachelor of Data Analytics & Decision Science',
    category: 'Technology & Data Science',
    overview: 'Master the tools and techniques of data-driven decision making. This program focuses on extracting insights from complex data sets.',
    keyAreas: ['Statistical Modeling', 'Big Data Technologies', 'Data Visualization', 'Decision Theory', 'Optimization Methods', 'Data Mining'],
    careers: ['Data Analyst', 'Decision Scientist', 'Data Engineer', 'Quantitative Analyst', 'Business Intelligence Developer', 'Analytics Consultant'],
  },
  'bachelor-of-cybersecurity': {
    title: 'Bachelor of Cybersecurity',
    category: 'Technology & Data Science',
    overview: 'Learn to protect systems and data from digital threats. This program covers network security, cryptography, and risk management.',
    keyAreas: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Information Security Management', 'Digital Forensics', 'Cyber Law & Ethics'],
    careers: ['Cybersecurity Analyst', 'Security Engineer', 'Penetration Tester', 'Information Security Manager', 'Security Consultant', 'Incident Responder'],
  },
  'bachelor-of-software-systems': {
    title: 'Bachelor of Software Systems & AI Engineering',
    category: 'Technology & Data Science',
    overview: 'Advanced study of software systems and AI integration. Students learn to build scalable, intelligent, and secure software applications.',
    keyAreas: ['Systems Engineering', 'Cloud Computing', 'AI Integration', 'Distributed Systems', 'Software Project Management', 'Human-Computer Interaction'],
    careers: ['Systems Engineer', 'Cloud Architect', 'AI Solutions Developer', 'Software Engineering Manager', 'DevOps Engineer', 'Technical Lead'],
  }
};

const ProgramDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  const program = slug ? programsData[slug] : null;

  if (!program) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-uns-navy mb-4">Program Not Found</h2>
        <p className="text-gray-600 mb-6">The program you are looking for does not exist or has been moved.</p>
        <Link to="/academics" className="bg-uns-gold text-uns-navy px-6 py-3 rounded font-bold hover:bg-yellow-400 transition-colors">
          View All Programs
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen size={18} /> },
    { id: 'curriculum', label: 'Curriculum', icon: <FileText size={18} /> },
    { id: 'fees', label: 'Fees', icon: <DollarSign size={18} /> },
    { id: 'scholarships', label: 'Scholarships', icon: <Award size={18} /> },
    { id: 'requirements', label: 'Requirements', icon: <CheckCircle2 size={18} /> },
    { id: 'careers', label: 'Careers', icon: <Briefcase size={18} /> },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-uns-navy text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/academics" className="inline-flex items-center text-uns-gold hover:text-yellow-300 mb-6 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to Programs
          </Link>
          <div className="inline-block bg-white/10 text-uns-gold px-3 py-1 rounded-full text-sm font-semibold mb-4">
            {program.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{program.title}</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-gray-200 mb-8 pb-px hide-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center whitespace-nowrap px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-uns-gold text-uns-navy'
                        : 'border-transparent text-gray-500 hover:text-uns-navy hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === 'overview' && (
                  <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-uns-navy mb-4">Program Overview</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-8">
                      {program.overview}
                    </p>
                    
                    <h3 className="text-xl font-bold text-uns-navy mb-4">Key Areas of Study</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {program.keyAreas.map((area, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle2 size={20} className="text-uns-gold mr-3 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-uns-navy mb-4">Curriculum</h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center">
                      <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 italic">Information will be updated by the relevant UNS office.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'fees' && (
                  <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-uns-navy mb-4">Tuition & Fees</h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center">
                      <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 italic">Information will be updated by the relevant UNS office.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'scholarships' && (
                  <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-uns-navy mb-4">Scholarships & Financial Aid</h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center">
                      <Award size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 italic">Information will be updated by the relevant UNS office.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-uns-navy mb-4">Admission Requirements</h2>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-center">
                      <CheckCircle2 size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 italic">Information will be updated by the relevant UNS office.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'careers' && (
                  <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-uns-navy mb-4">Career Opportunities</h2>
                    <p className="text-gray-700 mb-6">
                      Graduates of this program are well-prepared for a variety of professional roles, including:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {program.careers.map((career, index) => (
                        <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <Target size={20} className="text-uns-gold mr-3 flex-shrink-0" />
                          <span className="text-gray-800 font-medium">{career}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-uns-navy mb-4">Ready to Apply?</h3>
                <p className="text-gray-600 mb-6">
                  Take the next step in your academic journey. Our admissions team is here to help you through the process.
                </p>
                
                <div className="space-y-4 mb-8">
                  <Link 
                    to="/admissions" 
                    className="block w-full bg-uns-gold text-uns-navy text-center py-3 rounded font-bold hover:bg-yellow-400 transition-colors"
                  >
                    Apply Now
                  </Link>
                  <a 
                    href="https://wa.me/0905265390" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full bg-green-500 text-white text-center py-3 rounded font-bold hover:bg-green-600 transition-colors"
                  >
                    Chat on WhatsApp
                  </a>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-uns-navy mb-4">Contact Admissions</h4>
                  <div className="space-y-3">
                    <a href="tel:+0905265390" className="flex items-center text-gray-600 hover:text-uns-navy transition-colors">
                      <Phone size={18} className="mr-3 text-uns-gold" />
                      0905265390
                    </a>
                    <a href="mailto:info@uns.edu.so" className="flex items-center text-gray-600 hover:text-uns-navy transition-colors">
                      <Mail size={18} className="mr-3 text-uns-gold" />
                      info@uns.edu.so
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramDetail;
