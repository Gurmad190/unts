import { create } from 'zustand';

export interface Department {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Program {
  id: string;
  departmentId: string;
  name: string;
  level: 'Undergraduate' | 'Postgraduate' | 'PhD';
  duration: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  departmentId: string;
  programId: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  admissionYear: number;
  gpa?: number;
  address?: string;
}

export interface Application {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  programId: string;
  status: 'New' | 'Under Review' | 'Accepted' | 'Rejected' | 'Enrolled';
  dateApplied: string;
  notes?: string;
  documents?: string[];
}

export interface ContentItem {
  id: string;
  type: 'news' | 'announcement' | 'event' | 'scholarship';
  title: string;
  summary: string;
  body: string;
  date: string;
  status: 'Published' | 'Draft' | 'Archived';
}

interface AdminState {
  departments: Department[];
  programs: Program[];
  students: Student[];
  applications: Application[];
  contents: ContentItem[];

  // Department actions
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dept: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Program actions
  addProgram: (prog: Omit<Program, 'id'>) => void;
  updateProgram: (id: string, prog: Partial<Program>) => void;
  deleteProgram: (id: string) => void;

  // Student actions
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Application actions
  addApplication: (app: Omit<Application, 'id'>) => void;
  updateApplication: (id: string, app: Partial<Application>) => void;
  updateApplicationStatus: (id: string, status: Application['status'], notes?: string) => void;
  deleteApplication: (id: string) => void;

  // Content actions
  addContent: (content: Omit<ContentItem, 'id'>) => void;
  updateContent: (id: string, content: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
}

const initialDepartments: Department[] = [
  { id: 'd1', name: 'Social Sciences & Humanities', description: 'Explore human society, culture, and social relationships through interdisciplinary study.', status: 'active' },
  { id: 'd2', name: 'Business & Leadership', description: 'Develop essential skills in management, finance, and entrepreneurship for the modern business world.', status: 'active' },
  { id: 'd3', name: 'Health Sciences', description: 'Train future healthcare professionals with hands-on clinical experience and research.', status: 'active' },
  { id: 'd4', name: 'Technology & Data Science', description: 'Master cutting-edge computing, data analysis, and technology solutions for tomorrow\'s challenges.', status: 'active' },
];

const initialPrograms: Program[] = [
  { id: 'p1', departmentId: 'd4', name: 'BSc Computer Science', level: 'Undergraduate', duration: '4 Years', description: 'Comprehensive study of computing fundamentals, algorithms, software engineering, and AI.', status: 'active' },
  { id: 'p2', departmentId: 'd4', name: 'MSc Data Science', level: 'Postgraduate', duration: '2 Years', description: 'Advanced study in machine learning, big data analytics, and statistical modeling.', status: 'active' },
  { id: 'p3', departmentId: 'd2', name: 'Bachelor of Business Administration', level: 'Undergraduate', duration: '4 Years', description: 'Broad foundation in business management, marketing, accounting, and leadership.', status: 'active' },
  { id: 'p4', departmentId: 'd3', name: 'BSc Nursing', level: 'Undergraduate', duration: '4 Years', description: 'Professional nursing education combining theory with extensive clinical practice.', status: 'active' },
  { id: 'p5', departmentId: 'd1', name: 'BA Political Science', level: 'Undergraduate', duration: '4 Years', description: 'Study of government systems, political behavior, international relations, and public policy.', status: 'active' },
  { id: 'p6', departmentId: 'd1', name: 'BA Sociology', level: 'Undergraduate', duration: '4 Years', description: 'Examination of social life, social change, and the causes and consequences of human behavior.', status: 'active' },
  { id: 'p7', departmentId: 'd2', name: 'MBA', level: 'Postgraduate', duration: '2 Years', description: 'Advanced business management program focused on strategic leadership and global markets.', status: 'active' },
  { id: 'p8', departmentId: 'd3', name: 'MPH Public Health', level: 'Postgraduate', duration: '2 Years', description: 'Advanced training in epidemiology, health policy, and community health management.', status: 'active' },
  { id: 'p9', departmentId: 'd4', name: 'BSc Information Technology', level: 'Undergraduate', duration: '4 Years', description: 'Applied computing covering networks, systems administration, and enterprise IT solutions.', status: 'active' },
  { id: 'p10', departmentId: 'd1', name: 'MA Education', level: 'Postgraduate', duration: '2 Years', description: 'Advanced study in educational leadership, curriculum design, and pedagogy.', status: 'inactive' },
];

const initialStudents: Student[] = [
  { id: 's1', name: 'Faaduma Axmed Cali', email: 'faaduma.cali@uns.edu', phone: '+252615123456', dateOfBirth: '2001-03-15', gender: 'Female', departmentId: 'd4', programId: 'p1', status: 'Active', admissionYear: 2023, gpa: 3.85, address: 'Hargeisa, Somaliland' },
  { id: 's2', name: 'Cabdullaahi Maxamed Warsame', email: 'cabdullaahi.warsame@uns.edu', phone: '+252615234567', dateOfBirth: '1999-07-22', gender: 'Male', departmentId: 'd2', programId: 'p3', status: 'Active', admissionYear: 2022, gpa: 3.52, address: 'Garowe, Puntland' },
  { id: 's3', name: 'Layla Maxamuud Jaamac', email: 'layla.jaamac@uns.edu', phone: '+252615345678', dateOfBirth: '2000-11-08', gender: 'Female', departmentId: 'd3', programId: 'p4', status: 'Active', admissionYear: 2022, gpa: 3.71, address: 'Mogadishu, Banaadir' },
  { id: 's4', name: 'Maxamed Sheekh Axmed', email: 'maxamed.axmed@uns.edu', phone: '+252615456789', dateOfBirth: '1998-02-14', gender: 'Male', departmentId: 'd1', programId: 'p5', status: 'Graduated', admissionYear: 2019, gpa: 3.20, address: 'Bosaso, Bari' },
  { id: 's5', name: 'Sacad Aadan Cilmi', email: 'sacad.cilmi@uns.edu', phone: '+252615567890', dateOfBirth: '2001-05-30', gender: 'Male', departmentId: 'd4', programId: 'p9', status: 'Active', admissionYear: 2023, gpa: 3.44, address: 'Burco, Togdheer' },
  { id: 's6', name: 'Maryan Xasan Nuur', email: 'maryan.nuur@uns.edu', phone: '+252615678901', dateOfBirth: '2000-09-12', gender: 'Female', departmentId: 'd2', programId: 'p7', status: 'Active', admissionYear: 2021, gpa: 3.90, address: 'Hargeisa, Somaliland' },
  { id: 's7', name: 'Ibraahim Cabdiraxmaan Ducaale', email: 'ibraahim.ducaale@uns.edu', phone: '+252615789012', dateOfBirth: '1999-01-25', gender: 'Male', departmentId: 'd3', programId: 'p8', status: 'Active', admissionYear: 2022, gpa: 3.62, address: 'Kismaayo, Jubbada Hoose' },
  { id: 's8', name: 'Xaawo Abdi Shire', email: 'xaawo.shire@uns.edu', phone: '+252615890123', dateOfBirth: '2002-04-18', gender: 'Female', departmentId: 'd1', programId: 'p6', status: 'Active', admissionYear: 2024, gpa: 3.10, address: 'Garowe, Puntland' },
  { id: 's9', name: 'C/rashiid Maxamuud Dhaqane', email: 'crashiid.dhaqane@uns.edu', phone: '+252615901234', dateOfBirth: '1997-12-03', gender: 'Male', departmentId: 'd4', programId: 'p2', status: 'Active', admissionYear: 2021, gpa: 3.88, address: 'Mogadishu, Banaadir' },
  { id: 's10', name: 'Deeqa Cali Geedi', email: 'deeqa.geedi@uns.edu', phone: '+252615012345', dateOfBirth: '2000-08-27', gender: 'Female', departmentId: 'd2', programId: 'p3', status: 'Inactive', admissionYear: 2020, gpa: 2.75, address: 'Berbera, Sahil' },
  { id: 's11', name: 'Faarax Nuur Ciise', email: 'faarax.ciise@uns.edu', phone: '+252615111222', dateOfBirth: '1998-06-10', gender: 'Male', departmentId: 'd1', programId: 'p5', status: 'Active', admissionYear: 2020, gpa: 3.35, address: 'Lascaanod, Sool' },
  { id: 's12', name: 'Cawaale Xasan Barre', email: 'cawaale.barre@uns.edu', phone: '+252615222333', dateOfBirth: '2001-10-05', gender: 'Male', departmentId: 'd4', programId: 'p1', status: 'Suspended', admissionYear: 2023, gpa: 1.90, address: 'Marka, Shabeellaha Hoose' },
  { id: 's13', name: 'Faadumo Cali Maxamuud', email: 'fadumo.mm@uns.edu', phone: '+252615333444', dateOfBirth: '2002-02-14', gender: 'Female', departmentId: 'd3', programId: 'p4', status: 'Active', admissionYear: 2024, gpa: 3.95, address: 'Garowe, Puntland' },
  { id: 's14', name: 'Cabdisamad Yuusuf Axmed', email: 'cabdisamad.ya@uns.edu', phone: '+252615444555', dateOfBirth: '1999-11-20', gender: 'Male', departmentId: 'd2', programId: 'p7', status: 'Active', admissionYear: 2021, gpa: 3.48, address: 'Hargeisa, Somaliland' },
  { id: 's15', name: 'Raxmo Abdi Osman', email: 'raxmo.osman@uns.edu', phone: '+252615555666', dateOfBirth: '2000-07-09', gender: 'Female', departmentId: 'd1', programId: 'p6', status: 'Graduated', admissionYear: 2018, gpa: 3.72, address: 'Mogadishu, Banaadir' },
];

const initialApplications: Application[] = [
  { id: 'a1', applicantName: 'Muna Abdirahman Hashi', email: 'muna.hashi@email.com', phone: '+252616111222', programId: 'p1', status: 'New', dateApplied: '2026-08-15', notes: '', documents: ['Transcript', 'ID Copy'] },
  { id: 'a2', applicantName: 'C/laahi Sheekh Abdi', email: 'claahi.sheekh@email.com', phone: '+252616222333', programId: 'p2', status: 'Under Review', dateApplied: '2026-08-10', notes: 'Strong academic record. Recommendation letter pending.', documents: ['Transcript', 'ID Copy', 'Recommendation Letter'] },
  { id: 'a3', applicantName: 'Saamia Yusuf Mohamed', email: 'saamia.ym@email.com', phone: '+252616333444', programId: 'p3', status: 'Accepted', dateApplied: '2026-07-20', notes: 'Excellent candidate. Interview went very well.', documents: ['Transcript', 'ID Copy', 'Personal Statement'] },
  { id: 'a4', applicantName: 'Mustaf Abdi Omar', email: 'mustaf.omar@email.com', phone: '+252616444555', programId: 'p4', status: 'New', dateApplied: '2026-08-18', notes: '', documents: ['Transcript'] },
  { id: 'a5', applicantName: 'Ifrah Maow Isse', email: 'ifrah.isse@email.com', phone: '+252616555666', programId: 'p5', status: 'Under Review', dateApplied: '2026-08-05', notes: 'Good personal statement. Verify prerequisites.', documents: ['Transcript', 'ID Copy', 'Personal Statement', 'Recommendation Letter'] },
  { id: 'a6', applicantName: 'Maxamed Abdirizak Ali', email: 'maxamed.ra@email.com', phone: '+252616666777', programId: 'p1', status: 'Rejected', dateApplied: '2026-07-01', notes: 'Does not meet minimum GPA requirement.', documents: ['Transcript'] },
  { id: 'a7', applicantName: 'Nuur Cabdi Aaden', email: 'nuur.aaden@email.com', phone: '+252616777888', programId: 'p7', status: 'New', dateApplied: '2026-08-20', notes: '', documents: ['Transcript', 'CV', 'Personal Statement'] },
  { id: 'a8', applicantName: 'Sahra Abdirashid Hussein', email: 'sahra.hussein@email.com', phone: '+252616888999', programId: 'p8', status: 'Enrolled', dateApplied: '2026-06-15', notes: 'Enrolled for Fall semester.', documents: ['Transcript', 'ID Copy', 'Medical Certificate'] },
  { id: 'a9', applicantName: 'Abdishakur Mohamed Nor', email: 'abdishakur.nor@email.com', phone: '+252616999000', programId: 'p9', status: 'New', dateApplied: '2026-08-22', notes: '', documents: ['Transcript', 'ID Copy'] },
  { id: 'a10', applicantName: 'Fartun Ismail Jama', email: 'fartun.jama@email.com', phone: '+252616000111', programId: 'p6', status: 'Under Review', dateApplied: '2026-08-12', notes: 'Volunteer experience looks promising.', documents: ['Transcript', 'Personal Statement'] },
];

const initialContents: ContentItem[] = [
  { id: 'c1', type: 'news', title: 'UNS Ranked Among Top Universities in Horn of Africa', summary: 'University of Northeastern Somalia achieves top rankings in the 2026 regional university assessment.', body: 'The University of Northeastern Somalia (UNS) has been recognized as one of the top five universities in the Horn of Africa region. The ranking, published by the African University Standards Board, highlights UNS\'s commitment to academic excellence and research innovation.', date: '2026-08-25', status: 'Published' },
  { id: 'c2', type: 'news', title: 'New Computer Science Lab Opening Ceremony', summary: 'UNS inaugurates state-of-the-art computing lab funded by international technology partners.', body: 'A brand new Computer Science laboratory featuring the latest computing equipment was officially opened at UNS campus. The facility includes 50 high-performance workstations, server rooms, and dedicated AI research spaces.', date: '2026-08-18', status: 'Published' },
  { id: 'c3', type: 'announcement', title: 'Fall Semester Registration Now Open', summary: 'All students are reminded that registration for the Fall 2026 semester is now open.', body: 'Registration for the Fall 2026 semester officially opened on August 1st. Students are required to complete registration through the student portal or visit the Registrar\'s office. Early registration closes on September 15th.', date: '2026-08-01', status: 'Published' },
  { id: 'c4', type: 'announcement', title: 'Mid-Term Examination Schedule Released', summary: 'The schedule for mid-term examinations has been published on the academic portal.', body: 'The academic calendar for mid-term examinations has been finalized. Students are advised to review the schedule and prepare accordingly. Exams will begin on October 20th and conclude by November 5th.', date: '2026-08-28', status: 'Published' },
  { id: 'c5', type: 'event', title: 'Annual Science & Innovation Fair 2026', summary: 'Join us for the annual showcase of student research projects and innovations.', body: 'The UNS Annual Science & Innovation Fair will be held on October 15-16, 2026. Students from all departments are invited to present their research projects and innovations. Registration for presenters closes on October 1st.', date: '2026-10-15', status: 'Published' },
  { id: 'c6', type: 'event', title: 'Career Day & Job Fair', summary: 'Connect with leading employers and explore career opportunities across industries.', body: 'UNS is hosting its annual Career Day and Job Fair on November 10th, 2026. Over 30 national and international companies will participate. Students should bring updated CVs and dress professionally.', date: '2026-11-10', status: 'Draft' },
  { id: 'c7', type: 'scholarship', title: 'UNS Merit Scholarship Program', summary: 'Full tuition scholarships available for top-performing students in all departments.', body: 'The University of Northeastern Somalia is offering full tuition scholarships for the 2026-2027 academic year. Eligible students must have a GPA of 3.5 or above and demonstrate leadership potential. Application deadline: September 30, 2026.', date: '2026-08-01', status: 'Published' },
  { id: 'c8', type: 'scholarship', title: 'Women in Technology Scholarship', summary: 'Dedicated scholarships for female students pursuing degrees in Technology & Data Science.', body: 'In partnership with international technology organizations, UNS is offering 20 full scholarships specifically for women in the Technology & Data Science department. The scholarship covers tuition, books, and a monthly stipend.', date: '2026-08-15', status: 'Published' },
];

export const useAdminStore = create<AdminState>((set) => ({
  departments: initialDepartments,
  programs: initialPrograms,
  students: initialStudents,
  applications: initialApplications,
  contents: initialContents,

  // Department actions
  addDepartment: (dept) => set((state) => ({
    departments: [...state.departments, { ...dept, id: `d${Date.now()}` }]
  })),
  updateDepartment: (id, dept) => set((state) => ({
    departments: state.departments.map(d => d.id === id ? { ...d, ...dept } : d)
  })),
  deleteDepartment: (id) => set((state) => ({
    departments: state.departments.filter(d => d.id !== id)
  })),

  // Program actions
  addProgram: (prog) => set((state) => ({
    programs: [...state.programs, { ...prog, id: `p${Date.now()}` }]
  })),
  updateProgram: (id, prog) => set((state) => ({
    programs: state.programs.map(p => p.id === id ? { ...p, ...prog } : p)
  })),
  deleteProgram: (id) => set((state) => ({
    programs: state.programs.filter(p => p.id !== id)
  })),

  // Student actions
  addStudent: (student) => set((state) => ({
    students: [...state.students, { ...student, id: `s${Date.now()}` }]
  })),
  updateStudent: (id, student) => set((state) => ({
    students: state.students.map(s => s.id === id ? { ...s, ...student } : s)
  })),
  deleteStudent: (id) => set((state) => ({
    students: state.students.filter(s => s.id !== id)
  })),

  // Application actions
  addApplication: (app) => set((state) => ({
    applications: [...state.applications, { ...app, id: `a${Date.now()}` }]
  })),
  updateApplication: (id, app) => set((state) => ({
    applications: state.applications.map(a => a.id === id ? { ...a, ...app } : a)
  })),
  updateApplicationStatus: (id, status, notes) => set((state) => ({
    applications: state.applications.map(a => a.id === id ? { ...a, status, notes: notes !== undefined ? notes : a.notes } : a)
  })),
  deleteApplication: (id) => set((state) => ({
    applications: state.applications.filter(a => a.id !== id)
  })),

  // Content actions
  addContent: (content) => set((state) => ({
    contents: [...state.contents, { ...content, id: `c${Date.now()}` }]
  })),
  updateContent: (id, content) => set((state) => ({
    contents: state.contents.map(c => c.id === id ? { ...c, ...content } : c)
  })),
  deleteContent: (id) => set((state) => ({
    contents: state.contents.filter(c => c.id !== id)
  })),
}));
