import { isSupabaseConfigured, supabase } from './supabase';

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface Program {
  id: string;
  department_id: string;
  code: string;
  name: string;
  degree_level: string;
  duration_years: number;
  active: boolean;
}

export interface StudentRecord {
  id: string;
  profile_id: string | null;
  applicant_id: string | null;
  student_number: string;
  program_id: string;
  admission_term_id: string | null;
  status: string;
  enrollment_date: string | null;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  address?: string | null;
  admission_term_name?: string | null;
  program_name: string;
  department_name: string;
}

export interface ApplicationRecord {
  id: string;
  applicant_id: string;
  program_id: string;
  term_id: string;
  application_number: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  notes: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  program_name: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  content_type: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export interface AcademicTerm {
  id: string;
  name: string;
  code: string;
  starts_on: string;
  ends_on: string;
  academic_year: string | null;
  term_type: string | null;
  registration_opens: string | null;
  registration_closes: string | null;
  is_current: boolean;
}

export interface Course {
  id: string;
  department_id: string;
  program_id: string | null;
  code: string;
  title: string;
  credits: number;
  level: number | null;
  active: boolean;
  department_name: string;
  program_name: string | null;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_name: string;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PortalUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  roles: string[];
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  program_id: string;
  term_id: string;
  status: string;
  enrolled_at: string | null;
  term_name: string;
}

export interface StudentRegistration {
  id: string;
  enrollment_id: string;
  course_id: string;
  status: string;
  registered_at: string | null;
  course_code: string;
  course_title: string;
  credits: number;
}

export interface StudentGrade {
  id: string;
  registration_id: string;
  grade: string;
  grade_points: number | null;
  remarks: string | null;
}

export interface InvoiceRecord {
  id: string;
  student_id: string;
  term_id: string | null;
  invoice_number: string;
  amount: number;
  due_date: string | null;
  status: string;
  description: string | null;
  student_name?: string;
  student_number?: string;
  term_name?: string;
  paid_amount?: number;
  balance?: number;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  paid_at: string | null;
  notes: string | null;
}

export interface ScholarshipRecord {
  id: string;
  student_id: string;
  name: string;
  amount: number;
  status: string;
  awarded_at: string | null;
}

export interface StudentDocument {
  id: string;
  application_id: string;
  document_type: string;
  storage_path: string;
  file_name: string;
  status: string;
  uploaded_at: string;
  verified_at: string | null;
}

export interface BrandingSettings {
  id: string;
  university_name: string;
  logo_url: string | null;
  updated_at: string;
}

export interface StudentDetail {
  student: StudentRecord;
  applicant: { date_of_birth: string | null; nationality: string | null; address: string | null } | null;
  enrollments: StudentEnrollment[];
  registrations: StudentRegistration[];
  grades: StudentGrade[];
  transcripts: StudentPortalData['transcripts'];
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  scholarships: ScholarshipRecord[];
  documents: StudentDocument[];
  application_id: string | null;
}

export interface StudentPortalData {
  student: StudentRecord | null;
  program: Program | null;
  department: Department | null;
  currentTerm: AcademicTerm | null;
  announcements: Announcement[];
  enrollments: StudentEnrollment[];
  registrations: StudentRegistration[];
  grades: StudentGrade[];
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  scholarships: ScholarshipRecord[];
  documents: StudentDocument[];
  transcripts: Array<{
    id: string;
    term_id: string;
    term_name?: string;
    credits_attempted: number;
    credits_earned: number;
    term_gpa: number | null;
    cumulative_gpa: number | null;
  }>;
}

const requireClient = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }
  return supabase;
};

const unwrap = <T>(data: T | null, error: { message: string } | null) => {
  if (error) throw error;
  return data as T;
};

export const listDepartments = async (): Promise<Department[]> => {
  const client = requireClient();
  const { data, error } = await client.from('departments').select('id, code, name, description').order('name');
  return unwrap(data as Department[] | null, error);
};

export const listPrograms = async (): Promise<Program[]> => {
  const client = requireClient();
  const { data, error } = await client
    .from('programs')
    .select('id, department_id, code, name, degree_level, duration_years, active')
    .order('name');
  return unwrap(data as Program[] | null, error);
};

export const listActivePrograms = async (): Promise<Program[]> => {
  const programs = await listPrograms();
  return programs.filter((program) => program.active);
};

export const listAcademicTerms = async (): Promise<AcademicTerm[]> => {
  const client = requireClient();
  const { data, error } = await client.from('academic_terms').select('id, name, code, starts_on, ends_on, academic_year, term_type, registration_opens, registration_closes, is_current').order('starts_on', { ascending: false });
  return unwrap(data as AcademicTerm[] | null, error);
};

export const createAcademicTerm = async (input: Pick<AcademicTerm, 'name' | 'code' | 'starts_on' | 'ends_on' | 'is_current'> & Partial<Pick<AcademicTerm, 'academic_year' | 'term_type' | 'registration_opens' | 'registration_closes'>>) => {
  const client = requireClient();
  const { data, error } = await client.from('academic_terms').insert({ ...input, code: input.code.trim().toUpperCase(), is_current: false }).select('id, name, code, starts_on, ends_on, academic_year, term_type, registration_opens, registration_closes, is_current').single();
  return unwrap(data as AcademicTerm | null, error);
};

export const updateAcademicTerm = async (input: Pick<AcademicTerm, 'id' | 'name' | 'code' | 'starts_on' | 'ends_on'> & Partial<Pick<AcademicTerm, 'academic_year' | 'term_type' | 'registration_opens' | 'registration_closes'>>) => {
  const client = requireClient();
  const { data, error } = await client.rpc('update_academic_term', {
    p_term_id: input.id, p_name: input.name, p_code: input.code, p_starts_on: input.starts_on, p_ends_on: input.ends_on,
    p_academic_year: input.academic_year || null, p_term_type: input.term_type || null,
    p_registration_opens: input.registration_opens || null, p_registration_closes: input.registration_closes || null,
  });
  return unwrap(data as AcademicTerm | null, error);
};

export const setCurrentTerm = async (termId: string) => {
  const client = requireClient();
  const { data, error } = await client.rpc('set_current_term', { p_term_id: termId });
  return unwrap((Array.isArray(data) ? data[0] : data) as AcademicTerm | null, error);
};

export const listCourses = async (): Promise<Course[]> => {
  const client = requireClient();
  const { data: rows, error } = await client.from('courses').select('id, department_id, program_id, code, title, credits, level, active').order('code');
  if (error) throw error;
  const courses = rows ?? [];
  const departmentIds = courses.map((course) => course.department_id).filter((id): id is string => typeof id === 'string');
  const programIds = courses.map((course) => course.program_id).filter((id): id is string => typeof id === 'string');
  const [departmentsResult, programsResult] = await Promise.all([
    departmentIds.length ? client.from('departments').select('id, name').in('id', departmentIds) : Promise.resolve({ data: [], error: null }),
    programIds.length ? client.from('programs').select('id, name').in('id', programIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (departmentsResult.error) throw departmentsResult.error;
  if (programsResult.error) throw programsResult.error;
  const departments = new Map((departmentsResult.data ?? []).map((department) => [department.id, department.name]));
  const programs = new Map((programsResult.data ?? []).map((program) => [program.id, program.name]));
  return courses.map((course) => ({
    ...course,
    credits: Number(course.credits),
    level: course.level === null ? null : Number(course.level),
    department_name: departments.get(course.department_id) || 'Department not assigned',
    program_name: course.program_id ? programs.get(course.program_id) || null : null,
  })) as Course[];
};

export const createCourse = async (input: Omit<Course, 'id' | 'department_name' | 'program_name'>) => {
  const client = requireClient();
  const { data, error } = await client.from('courses').insert(input).select('id, department_id, program_id, code, title, credits, level, active').single();
  if (error) throw error;
  const courses = await listCourses();
  return courses.find((course) => course.id === data.id) as Course;
};

export const updateCourseStatus = async (id: string, active: boolean) => {
  const client = requireClient();
  const { data, error } = await client.from('courses').update({ active, updated_at: new Date().toISOString() }).eq('id', id).select('id, department_id, program_id, code, title, credits, level, active').single();
  if (error) throw error;
  const courses = await listCourses();
  return courses.find((course) => course.id === data.id) as Course;
};

export const getCurrentTerm = async () => {
  const client = requireClient();
  const { data, error } = await client
    .from('academic_terms')
    .select('id, name, code, starts_on, ends_on, academic_year, term_type, registration_opens, registration_closes, is_current')
    .eq('is_current', true)
    .order('starts_on', { ascending: false })
    .limit(1)
    .maybeSingle();
  return unwrap(data, error) as AcademicTerm | null;
};

export const listAdminStudents = async (): Promise<StudentRecord[]> => {
  const client = requireClient();
  const { data: rows, error } = await client.from('students').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const students = (rows ?? []) as Array<Record<string, unknown>>;
  const profileIds = students.map((row) => row.profile_id).filter((id): id is string => typeof id === 'string');
  const applicantIds = students.map((row) => row.applicant_id).filter((id): id is string => typeof id === 'string');
  const programIds = students.map((row) => row.program_id).filter((id): id is string => typeof id === 'string');
  const termIds = students.map((row) => row.admission_term_id).filter((id): id is string => typeof id === 'string');
  const [profilesResult, applicantsResult, programsResult, termsResult, departments] = await Promise.all([
    profileIds.length ? client.from('profiles').select('id, full_name, email, phone, avatar_url').in('id', profileIds) : Promise.resolve({ data: [], error: null }),
    applicantIds.length ? client.from('applicants').select('id, full_name, email, phone, date_of_birth, nationality, address').in('id', applicantIds) : Promise.resolve({ data: [], error: null }),
    programIds.length ? client.from('programs').select('id, name, department_id').in('id', programIds) : Promise.resolve({ data: [], error: null }),
    termIds.length ? client.from('academic_terms').select('id, name').in('id', termIds) : Promise.resolve({ data: [], error: null }),
    listDepartments(),
  ]);
  if (profilesResult.error) throw profilesResult.error;
  if (applicantsResult.error) throw applicantsResult.error;
  if (programsResult.error) throw programsResult.error;
  if (termsResult.error) throw termsResult.error;
  const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const applicants = new Map((applicantsResult.data ?? []).map((applicant) => [applicant.id, applicant]));
  const programs = new Map((programsResult.data ?? []).map((program) => [program.id, program]));
  const terms = new Map((termsResult.data ?? []).map((term) => [term.id, term.name]));
  const departmentMap = new Map(departments.map((department) => [department.id, department.name]));

  return students.map((row) => {
    const profile = typeof row.profile_id === 'string' ? profiles.get(row.profile_id) : undefined;
    const applicant = typeof row.applicant_id === 'string' ? applicants.get(row.applicant_id) : undefined;
    const program = typeof row.program_id === 'string' ? programs.get(row.program_id) : undefined;
    return {
      id: String(row.id),
      profile_id: typeof row.profile_id === 'string' ? row.profile_id : null,
      applicant_id: typeof row.applicant_id === 'string' ? row.applicant_id : null,
      student_number: String(row.student_number),
      program_id: String(row.program_id),
      admission_term_id: typeof row.admission_term_id === 'string' ? row.admission_term_id : null,
      status: String(row.status),
      enrollment_date: typeof row.enrollment_date === 'string' ? row.enrollment_date : null,
      name: profile?.full_name || applicant?.full_name || 'Unnamed student',
      email: profile?.email || applicant?.email || '—',
      phone: profile?.phone || applicant?.phone || null,
      avatar_url: profile?.avatar_url || null,
      date_of_birth: applicant?.date_of_birth || null,
      nationality: applicant?.nationality || null,
      address: applicant?.address || null,
      admission_term_name: typeof row.admission_term_id === 'string' ? terms.get(row.admission_term_id) || null : null,
      program_name: program?.name || 'Programme not assigned',
      department_name: program ? departmentMap.get(program.department_id) || 'Department not assigned' : 'Department not assigned',
    };
  });
};

export const listApplications = async (): Promise<ApplicationRecord[]> => {
  const client = requireClient();
  const { data: rows, error } = await client.from('applications').select('*').order('submitted_at', { ascending: false });
  if (error) throw error;
  const applications = (rows ?? []) as Array<Record<string, unknown>>;
  const applicantIds = applications.map((row) => row.applicant_id).filter((id): id is string => typeof id === 'string');
  const programIds = applications.map((row) => row.program_id).filter((id): id is string => typeof id === 'string');
  const [applicantsResult, programsResult] = await Promise.all([
    applicantIds.length ? client.from('applicants').select('id, full_name, email, phone').in('id', applicantIds) : Promise.resolve({ data: [], error: null }),
    programIds.length ? client.from('programs').select('id, name').in('id', programIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (applicantsResult.error) throw applicantsResult.error;
  if (programsResult.error) throw programsResult.error;
  const applicants = new Map((applicantsResult.data ?? []).map((applicant) => [applicant.id, applicant]));
  const programs = new Map((programsResult.data ?? []).map((program) => [program.id, program.name]));

  return applications.map((row) => {
    const applicant = typeof row.applicant_id === 'string' ? applicants.get(row.applicant_id) : undefined;
    return {
      id: String(row.id),
      applicant_id: String(row.applicant_id),
      program_id: String(row.program_id),
      term_id: String(row.term_id),
      application_number: String(row.application_number),
      status: String(row.status),
      submitted_at: String(row.submitted_at),
      reviewed_at: typeof row.reviewed_at === 'string' ? row.reviewed_at : null,
      notes: typeof row.notes === 'string' ? row.notes : null,
      applicant_name: applicant?.full_name || 'Unnamed applicant',
      applicant_email: applicant?.email || '—',
      applicant_phone: applicant?.phone || null,
      program_name: typeof row.program_id === 'string' ? programs.get(row.program_id) || 'Programme not found' : 'Programme not found',
    };
  });
};

export const listAnnouncements = async (includeDrafts = false): Promise<Announcement[]> => {
  const client = requireClient();
  let query = client.from('announcements').select('id, title, summary, body, content_type, status, published_at, created_at').order('created_at', { ascending: false });
  if (!includeDrafts) query = query.eq('status', 'published');
  const { data, error } = await query;
  return unwrap(data as Announcement[] | null, error);
};

export const listPortalUsers = async (): Promise<PortalUser[]> => {
  const client = requireClient();
  const { data: profiles, error: profileError } = await client.from('profiles').select('id, full_name, email, phone, avatar_url').order('full_name');
  if (profileError) throw profileError;
  const profileRows = profiles ?? [];
  const ids = profileRows.map((profile) => profile.id);
  const { data: roles, error: rolesError } = ids.length
    ? await client.from('user_roles').select('user_id, role').in('user_id', ids)
    : { data: [], error: null };
  if (rolesError) throw rolesError;
  const rolesByUser = new Map<string, string[]>();
  for (const role of roles ?? []) rolesByUser.set(role.user_id, [...(rolesByUser.get(role.user_id) ?? []), role.role]);
  return profileRows.map((profile) => ({ ...profile, roles: rolesByUser.get(profile.id) ?? [] }));
};

const loadStudentDetailRecords = async (studentId: string): Promise<StudentDetail> => {
  const client = requireClient();
  const { data: row, error: studentError } = await client.from('students').select('*').eq('id', studentId).maybeSingle();
  if (studentError) throw studentError;
  if (!row) throw new Error('Student record not found.');
  const studentRow = row as Record<string, unknown>;
  const [programs, departments, terms, courses, profileResult, applicantResult] = await Promise.all([
    listPrograms(),
    listDepartments(),
    listAcademicTerms(),
    listCourses(),
    typeof studentRow.profile_id === 'string' ? client.from('profiles').select('id, full_name, email, phone, avatar_url').eq('id', studentRow.profile_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    typeof studentRow.applicant_id === 'string' ? client.from('applicants').select('id, full_name, email, phone, date_of_birth, nationality, address').eq('id', studentRow.applicant_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (applicantResult.error) throw applicantResult.error;
  const program = programs.find((item) => item.id === studentRow.program_id) ?? null;
  const department = program ? departments.find((item) => item.id === program.department_id) ?? null : null;
  const profile = profileResult.data as { full_name?: string; email?: string; phone?: string | null; avatar_url?: string | null } | null;
  const applicant = applicantResult.data as { full_name?: string; email?: string; phone?: string | null; date_of_birth?: string | null; nationality?: string | null; address?: string | null } | null;
  const termMap = new Map(terms.map((term) => [term.id, term]));

  const student: StudentRecord = {
    id: String(studentRow.id),
    profile_id: typeof studentRow.profile_id === 'string' ? studentRow.profile_id : null,
    applicant_id: typeof studentRow.applicant_id === 'string' ? studentRow.applicant_id : null,
    student_number: String(studentRow.student_number),
    program_id: String(studentRow.program_id),
    admission_term_id: typeof studentRow.admission_term_id === 'string' ? studentRow.admission_term_id : null,
    status: String(studentRow.status),
    enrollment_date: typeof studentRow.enrollment_date === 'string' ? studentRow.enrollment_date : null,
    name: profile?.full_name || applicant?.full_name || 'Unnamed student',
    email: profile?.email || applicant?.email || '—',
    phone: profile?.phone || applicant?.phone || null,
    avatar_url: profile?.avatar_url || null,
    date_of_birth: applicant?.date_of_birth || null,
    nationality: applicant?.nationality || null,
    address: applicant?.address || null,
    admission_term_name: typeof studentRow.admission_term_id === 'string' ? termMap.get(studentRow.admission_term_id)?.name || null : null,
    program_name: program?.name || 'Programme not assigned',
    department_name: department?.name || 'Department not assigned',
  };

  const { data: enrollmentRows, error: enrollmentError } = await client.from('enrollments').select('id, student_id, program_id, term_id, status, enrolled_at').eq('student_id', studentId).order('enrolled_at', { ascending: false });
  if (enrollmentError) throw enrollmentError;
  const enrollments: StudentEnrollment[] = (enrollmentRows ?? []).map((enrollment) => ({
    ...enrollment,
    term_name: termMap.get(enrollment.term_id)?.name || enrollment.term_id,
  })) as StudentEnrollment[];
  const enrollmentIds = enrollments.map((enrollment) => enrollment.id);
  const { data: registrationRows, error: registrationError } = enrollmentIds.length
    ? await client.from('course_registrations').select('id, enrollment_id, course_id, status, registered_at').in('enrollment_id', enrollmentIds).order('registered_at', { ascending: false })
    : { data: [], error: null };
  if (registrationError) throw registrationError;
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const registrations: StudentRegistration[] = (registrationRows ?? []).map((registration) => {
    const course = courseMap.get(registration.course_id);
    return {
      id: registration.id,
      enrollment_id: registration.enrollment_id,
      course_id: registration.course_id,
      status: registration.status,
      registered_at: registration.registered_at,
      course_code: course?.code || registration.course_id,
      course_title: course?.title || 'Course unavailable',
      credits: course?.credits || 0,
    };
  });
  const registrationIds = registrations.map((registration) => registration.id);
  const { data: gradeRows, error: gradeError } = registrationIds.length
    ? await client.from('grades').select('id, registration_id, grade, grade_points, remarks').in('registration_id', registrationIds)
    : { data: [], error: null };
  if (gradeError) throw gradeError;
  const grades: StudentGrade[] = (gradeRows ?? []).map((grade) => ({ ...grade, grade_points: grade.grade_points === null ? null : Number(grade.grade_points) })) as StudentGrade[];

  const [transcriptResult, invoiceResult, scholarshipResult, applicationResult] = await Promise.all([
    client.from('transcripts').select('id, term_id, credits_attempted, credits_earned, term_gpa, cumulative_gpa').eq('student_id', studentId).order('generated_at', { ascending: false }),
    client.from('invoices').select('id, student_id, term_id, invoice_number, amount, due_date, status, description').eq('student_id', studentId).order('due_date', { ascending: false }),
    client.from('scholarships').select('id, student_id, name, amount, status, awarded_at').eq('student_id', studentId).order('awarded_at', { ascending: false }),
    typeof studentRow.applicant_id === 'string' ? client.from('applications').select('id').eq('applicant_id', studentRow.applicant_id) : Promise.resolve({ data: [], error: null }),
  ]);
  if (transcriptResult.error) throw transcriptResult.error;
  if (invoiceResult.error) throw invoiceResult.error;
  if (scholarshipResult.error) throw scholarshipResult.error;
  if (applicationResult.error) throw applicationResult.error;
  const transcriptRows = (transcriptResult.data ?? []) as Array<Record<string, unknown>>;
  const transcripts = transcriptRows.map((transcript) => ({
    id: String(transcript.id),
    term_id: String(transcript.term_id),
    term_name: termMap.get(String(transcript.term_id))?.name,
    credits_attempted: Number(transcript.credits_attempted),
    credits_earned: Number(transcript.credits_earned),
    term_gpa: transcript.term_gpa === null ? null : Number(transcript.term_gpa),
    cumulative_gpa: transcript.cumulative_gpa === null ? null : Number(transcript.cumulative_gpa),
  }));
  const invoiceRows = (invoiceResult.data ?? []) as Array<Record<string, unknown>>;
  const invoiceIds = invoiceRows.map((invoice) => String(invoice.id));
  const { data: paymentRows, error: paymentError } = invoiceIds.length
    ? await client.from('payments').select('id, invoice_id, student_id, amount, payment_method, reference, paid_at, notes').in('invoice_id', invoiceIds).order('paid_at', { ascending: false })
    : { data: [], error: null };
  if (paymentError) throw paymentError;
  const payments: PaymentRecord[] = (paymentRows ?? []).map((payment) => ({ ...payment, amount: Number(payment.amount) })) as PaymentRecord[];
  const paidByInvoice = new Map<string, number>();
  payments.forEach((payment) => paidByInvoice.set(payment.invoice_id, (paidByInvoice.get(payment.invoice_id) || 0) + payment.amount));
  const invoices: InvoiceRecord[] = invoiceRows.map((invoice) => {
    const amount = Number(invoice.amount);
    const paidAmount = paidByInvoice.get(String(invoice.id)) || 0;
    return {
      id: String(invoice.id), student_id: String(invoice.student_id), term_id: typeof invoice.term_id === 'string' ? invoice.term_id : null,
      invoice_number: String(invoice.invoice_number), amount, due_date: typeof invoice.due_date === 'string' ? invoice.due_date : null,
      status: String(invoice.status), description: typeof invoice.description === 'string' ? invoice.description : null,
      term_name: typeof invoice.term_id === 'string' ? termMap.get(invoice.term_id)?.name : undefined, paid_amount: paidAmount, balance: Math.max(0, amount - paidAmount),
    };
  });
  const scholarships: ScholarshipRecord[] = (scholarshipResult.data ?? []).map((scholarship) => ({ ...scholarship, amount: Number(scholarship.amount) })) as ScholarshipRecord[];
  const applicationIds = (applicationResult.data ?? []).map((application) => application.id);
  const { data: documentRows, error: documentError } = applicationIds.length
    ? await client.from('application_documents').select('id, application_id, document_type, storage_path, file_name, status, uploaded_at, verified_at').in('application_id', applicationIds).order('uploaded_at', { ascending: false })
    : { data: [], error: null };
  if (documentError) throw documentError;

  return {
    student,
    applicant: applicant ? { date_of_birth: applicant.date_of_birth || null, nationality: applicant.nationality || null, address: applicant.address || null } : null,
    enrollments,
    registrations,
    grades,
    transcripts,
    invoices,
    payments,
    scholarships,
    documents: (documentRows ?? []) as StudentDocument[],
    application_id: applicationIds[0] || null,
  };
};

export const getStudentDetail = loadStudentDetailRecords;

export const getStudentPortalData = async (userId: string): Promise<StudentPortalData> => {
  const client = requireClient();
  const { data: row, error } = await client.from('students').select('id').eq('profile_id', userId).maybeSingle();
  if (error) throw error;
  const [announcements, currentTerm, programs, departments] = await Promise.all([listAnnouncements(), getCurrentTerm(), listPrograms(), listDepartments()]);
  if (!row) return { student: null, program: null, department: null, currentTerm, announcements, enrollments: [], registrations: [], grades: [], invoices: [], payments: [], scholarships: [], documents: [], transcripts: [] };
  const detail = await loadStudentDetailRecords(row.id);
  const program = programs.find((item) => item.id === detail.student.program_id) || null;
  const department = program ? departments.find((item) => item.id === program.department_id) || null : null;
  return { ...detail, program, department, currentTerm, announcements };
};

export const getBranding = async (): Promise<BrandingSettings> => {
  const client = requireClient();
  const { data, error } = await client.from('branding_settings').select('id, university_name, logo_url, updated_at').eq('id', 'global').maybeSingle();
  if (error) throw error;
  return (data || { id: 'global', university_name: 'University of Northeastern Somalia', logo_url: null, updated_at: new Date().toISOString() }) as BrandingSettings;
};

export const updateBranding = async (universityName: string, logoUrl: string | null) => {
  const client = requireClient();
  const { data, error } = await client.rpc('update_branding', { p_university_name: universityName, p_logo_url: logoUrl });
  return unwrap(data as BrandingSettings | null, error);
};

const safeFileName = (name: string) => name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');

export const updateOwnProfileAvatar = async (userId: string, file: File) => {
  const client = requireClient();
  const path = `${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await client.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await client.rpc('update_own_profile_avatar', { p_avatar_path: path });
  return unwrap(data as string | null, error);
};

export const getPrivateStorageUrl = async (bucket: string, path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const client = requireClient();
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
};

export const uploadBrandingLogo = async (file: File, universityName: string) => {
  const client = requireClient();
  const path = `global/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await client.storage.from('branding').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data } = client.storage.from('branding').getPublicUrl(path);
  return updateBranding(universityName, data.publicUrl);
};

export const updateStudentProfile = async (input: {
  studentId: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  programId: string | null;
  admissionTermId: string | null;
}) => {
  const client = requireClient();
  const { data, error } = await client.rpc('update_student_profile', {
    p_student_id: input.studentId,
    p_full_name: input.fullName,
    p_phone: input.phone || null,
    p_date_of_birth: input.dateOfBirth || null,
    p_nationality: input.nationality || null,
    p_address: input.address || null,
    p_program_id: input.programId || null,
    p_admission_term_id: input.admissionTermId || null,
  });
  return unwrap((Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null, error);
};

export const registerStudentCourse = async (studentId: string, termId: string, courseId: string) => {
  const client = requireClient();
  const { data, error } = await client.rpc('register_student_course', { p_student_id: studentId, p_term_id: termId, p_course_id: courseId });
  return unwrap((Array.isArray(data) ? data[0] : data) as { registration_id: string; enrollment_id: string; course_id: string; status: string } | null, error);
};

export const dropStudentCourse = async (registrationId: string) => {
  const client = requireClient();
  const { data, error } = await client.rpc('drop_student_course', { p_registration_id: registrationId });
  return unwrap((Array.isArray(data) ? data[0] : data) as { registration_id: string; status: string } | null, error);
};

export const recordCourseGrade = async (registrationId: string, grade: string, gradePoints: number, remarks: string) => {
  const client = requireClient();
  const { data, error } = await client.rpc('record_course_grade', { p_registration_id: registrationId, p_grade: grade, p_grade_points: gradePoints, p_remarks: remarks || null });
  return unwrap((Array.isArray(data) ? data[0] : data) as StudentGrade | null, error);
};

export const listInvoices = async (): Promise<InvoiceRecord[]> => {
  const client = requireClient();
  const [{ data, error }, students, terms] = await Promise.all([
    client.from('invoices').select('id, student_id, term_id, invoice_number, amount, due_date, status, description').order('due_date', { ascending: false }),
    listAdminStudents(),
    listAcademicTerms(),
  ]);
  if (error) throw error;
  const invoiceRows = (data ?? []) as Array<Record<string, unknown>>;
  const invoiceIds = invoiceRows.map((invoice) => String(invoice.id));
  const { data: paymentRows, error: paymentError } = invoiceIds.length
    ? await client.from('payments').select('invoice_id, amount').in('invoice_id', invoiceIds)
    : { data: [], error: null };
  if (paymentError) throw paymentError;
  const paidByInvoice = new Map<string, number>();
  (paymentRows ?? []).forEach((payment) => paidByInvoice.set(payment.invoice_id, (paidByInvoice.get(payment.invoice_id) || 0) + Number(payment.amount)));
  const studentsById = new Map(students.map((student) => [student.id, student]));
  const termsById = new Map(terms.map((term) => [term.id, term]));
  return invoiceRows.map((invoice) => {
    const amount = Number(invoice.amount);
    const paidAmount = paidByInvoice.get(String(invoice.id)) || 0;
    const student = studentsById.get(String(invoice.student_id));
    const term = typeof invoice.term_id === 'string' ? termsById.get(invoice.term_id) : undefined;
    return {
      id: String(invoice.id), student_id: String(invoice.student_id), term_id: typeof invoice.term_id === 'string' ? invoice.term_id : null,
      invoice_number: String(invoice.invoice_number), amount, due_date: typeof invoice.due_date === 'string' ? invoice.due_date : null,
      status: String(invoice.status), description: typeof invoice.description === 'string' ? invoice.description : null,
      student_name: student?.name, student_number: student?.student_number, term_name: term?.name,
      paid_amount: paidAmount, balance: Math.max(0, amount - paidAmount),
    };
  });
};

export const createInvoice = async (input: { studentId: string; termId: string; invoiceNumber: string; amount: number; dueDate: string; description: string }) => {
  const client = requireClient();
  const { data, error } = await client.rpc('create_invoice', {
    p_student_id: input.studentId, p_term_id: input.termId, p_invoice_number: input.invoiceNumber,
    p_amount: input.amount, p_due_date: input.dueDate, p_description: input.description || null,
  });
  return unwrap(data as InvoiceRecord | null, error);
};

export const recordPayment = async (input: { invoiceId: string; amount: number; paymentMethod: string; reference: string; notes: string }) => {
  const client = requireClient();
  const { data, error } = await client.rpc('record_payment', {
    p_invoice_id: input.invoiceId, p_amount: input.amount, p_payment_method: input.paymentMethod,
    p_reference: input.reference || null, p_notes: input.notes || null,
  });
  return unwrap((Array.isArray(data) ? data[0] : data) as { payment_id: string; invoice_id: string; invoice_status: string } | null, error);
};

export const uploadStudentDocument = async (applicationId: string, documentType: string, file: File) => {
  const client = requireClient();
  const path = `${applicationId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await client.storage.from('student-documents').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await client.rpc('create_application_document', {
    p_application_id: applicationId, p_document_type: documentType, p_storage_path: path, p_file_name: file.name,
  });
  return unwrap(data as StudentDocument | null, error);
};

export const verifyApplicationDocument = async (documentId: string, status: 'pending' | 'verified' | 'rejected') => {
  const client = requireClient();
  const { data, error } = await client.rpc('verify_application_document', { p_document_id: documentId, p_status: status });
  return unwrap(data as StudentDocument | null, error);
};

export const createDepartment = async (input: Pick<Department, 'code' | 'name' | 'description'>) => {
  const client = requireClient();
  const { data, error } = await client.from('departments').insert(input).select('id, code, name, description').single();
  return unwrap(data as Department | null, error);
};

export const createProgram = async (input: Omit<Program, 'id'>) => {
  const client = requireClient();
  const { data, error } = await client.from('programs').insert(input).select('id, department_id, code, name, degree_level, duration_years, active').single();
  return unwrap(data as Program | null, error);
};

export const createAnnouncement = async (input: Pick<Announcement, 'title' | 'summary' | 'body' | 'content_type' | 'status'>) => {
  const client = requireClient();
  const { data, error } = await client.from('announcements').insert({ ...input, published_at: input.status === 'published' ? new Date().toISOString() : null }).select('id, title, summary, body, content_type, status, published_at, created_at').single();
  return unwrap(data as Announcement | null, error);
};

export const updateAnnouncementStatus = async (id: string, status: string) => {
  const client = requireClient();
  const { data, error } = await client.from('announcements').update({ status, published_at: status === 'published' ? new Date().toISOString() : null }).eq('id', id).select('id, title, summary, body, content_type, status, published_at, created_at').single();
  return unwrap(data as Announcement | null, error);
};

export const submitApplication = async (input: {
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  programId: string;
  termId: string;
}) => {
  const client = requireClient();
  const { data, error } = await client.rpc('submit_application', {
    p_email: input.email,
    p_full_name: input.fullName,
    p_phone: input.phone || null,
    p_date_of_birth: input.dateOfBirth || null,
    p_nationality: input.nationality || null,
    p_address: input.address || null,
    p_program_id: input.programId,
    p_term_id: input.termId,
  });
  return unwrap(data as Array<{ application_id: string; application_number: string }> | null, error);
};

export const approveApplication = async (applicationId: string, decision: 'accepted' | 'rejected' | 'waitlisted', notes?: string) => {
  const client = requireClient();
  const { data, error } = await client.functions.invoke('approve-student-application', {
    body: { applicationId, decision, notes: notes || null },
  });
  return unwrap(data as { result: { application_id: string; application_status: string; student_id: string | null; student_number: string | null }; accountCreated: boolean; temporaryPassword: string | null } | null, error);
};

export const setApplicationStatus = async (applicationId: string, status: 'new' | 'review' | 'withdrawn', notes?: string) => {
  const client = requireClient();
  const { data, error } = await client.rpc('set_application_status', { p_application_id: applicationId, p_status: status, p_notes: notes || null });
  return unwrap((Array.isArray(data) ? data[0] : data) as { application_id: string; application_status: string; reviewed_at: string | null; notes: string | null } | null, error);
};

export const updateStudentStatus = async (studentId: string, status: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'inactive') => {
  const client = requireClient();
  const { data, error } = await client.rpc('update_student_status', { p_student_id: studentId, p_status: status });
  return unwrap((Array.isArray(data) ? data[0] : data) as { student_id: string; student_status: string } | null, error);
};

export const enrollStudentInTerm = async (studentId: string, termId: string) => {
  const client = requireClient();
  const { data, error } = await client.rpc('enroll_student_in_term', { p_student_id: studentId, p_term_id: termId });
  return unwrap((Array.isArray(data) ? data[0] : data) as { enrollment_id: string; student_id: string; program_id: string; term_id: string; enrollment_status: string } | null, error);
};

export const listAuditLogs = async (): Promise<AuditLog[]> => {
  const client = requireClient();
  const { data: rows, error } = await client.from('audit_logs').select('id, actor_id, action, entity_type, entity_id, metadata, created_at').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  const actorIds = (rows ?? []).map((row) => row.actor_id).filter((id): id is string => typeof id === 'string');
  const { data: profiles, error: profilesError } = actorIds.length ? await client.from('profiles').select('id, full_name, email').in('id', actorIds) : { data: [], error: null };
  if (profilesError) throw profilesError;
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  return (rows ?? []).map((row) => {
    const actor = typeof row.actor_id === 'string' ? profileMap.get(row.actor_id) : undefined;
    return {
      id: String(row.id),
      actor_id: typeof row.actor_id === 'string' ? row.actor_id : null,
      actor_name: actor?.full_name || 'System / public submission',
      actor_email: actor?.email || '',
      action: String(row.action),
      entity_type: String(row.entity_type),
      entity_id: typeof row.entity_id === 'string' ? row.entity_id : null,
      metadata: (row.metadata || {}) as Record<string, unknown>,
      created_at: String(row.created_at),
    };
  });
};

export const updatePortalUser = async (input: { userId: string; fullName: string; phone: string; role: string }) => {
  const client = requireClient();
  const { data, error } = await client.functions.invoke('admin-update-user', { body: input });
  return unwrap(data as { user: { id: string; full_name: string; email: string; phone: string | null; role: string } } | null, error);
};

export const createStaffUser = async (input: { email: string; fullName: string; password: string; role: string; phone: string }) => {
  const client = requireClient();
  const { data, error } = await client.functions.invoke('admin-create-user', { body: input });
  return unwrap(data as { user: { id: string; email: string; fullName: string; role: string } } | null, error);
};
