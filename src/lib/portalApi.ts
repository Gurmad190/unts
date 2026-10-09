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
  roles: string[];
}

export interface StudentPortalData {
  student: StudentRecord | null;
  program: Program | null;
  department: Department | null;
  announcements: Announcement[];
  transcripts: Array<{
    id: string;
    term_id: string;
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
  const { data, error } = await client.from('academic_terms').select('id, name, code, starts_on, ends_on, is_current').order('starts_on', { ascending: false });
  return unwrap(data as AcademicTerm[] | null, error);
};

export const createAcademicTerm = async (input: Pick<AcademicTerm, 'name' | 'code' | 'starts_on' | 'ends_on' | 'is_current'>) => {
  const client = requireClient();
  const { data, error } = await client.from('academic_terms').insert({ ...input, code: input.code.trim().toUpperCase(), is_current: false }).select('id, name, code, starts_on, ends_on, is_current').single();
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
    .select('id, name, code, starts_on, ends_on, is_current')
    .eq('is_current', true)
    .order('starts_on', { ascending: false })
    .limit(1)
    .maybeSingle();
  return unwrap(data, error) as { id: string; name: string; code: string; starts_on: string; ends_on: string; is_current: boolean } | null;
};

export const listAdminStudents = async (): Promise<StudentRecord[]> => {
  const client = requireClient();
  const { data: rows, error } = await client.from('students').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const students = (rows ?? []) as Array<Record<string, unknown>>;
  const profileIds = students.map((row) => row.profile_id).filter((id): id is string => typeof id === 'string');
  const programIds = students.map((row) => row.program_id).filter((id): id is string => typeof id === 'string');
  const [profilesResult, programsResult, departments] = await Promise.all([
    profileIds.length ? client.from('profiles').select('id, full_name, email, phone').in('id', profileIds) : Promise.resolve({ data: [], error: null }),
    programIds.length ? client.from('programs').select('id, name, department_id').in('id', programIds) : Promise.resolve({ data: [], error: null }),
    listDepartments(),
  ]);
  if (profilesResult.error) throw profilesResult.error;
  if (programsResult.error) throw programsResult.error;
  const profiles = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const programs = new Map((programsResult.data ?? []).map((program) => [program.id, program]));
  const departmentMap = new Map(departments.map((department) => [department.id, department.name]));

  return students.map((row) => {
    const profile = typeof row.profile_id === 'string' ? profiles.get(row.profile_id) : undefined;
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
      name: profile?.full_name || 'Unnamed student',
      email: profile?.email || '—',
      phone: profile?.phone || null,
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
  const { data: profiles, error: profileError } = await client.from('profiles').select('id, full_name, email, phone').order('full_name');
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

export const getStudentPortalData = async (userId: string): Promise<StudentPortalData> => {
  const client = requireClient();
  const { data: row, error } = await client.from('students').select('*').eq('profile_id', userId).maybeSingle();
  if (error) throw error;
  const student = row as Record<string, unknown> | null;
  const [programs, departments, announcements] = await Promise.all([listPrograms(), listDepartments(), listAnnouncements()]);
  if (!student) return { student: null, program: null, department: null, announcements, transcripts: [] };
  const program = programs.find((item) => item.id === student.program_id) ?? null;
  const department = program ? departments.find((item) => item.id === program.department_id) ?? null : null;
  const { data: profile } = await client.from('profiles').select('full_name, email, phone').eq('id', userId).maybeSingle();
  const { data: transcripts, error: transcriptError } = await client.from('transcripts').select('id, term_id, credits_attempted, credits_earned, term_gpa, cumulative_gpa').eq('student_id', student.id).order('generated_at', { ascending: false });
  if (transcriptError) throw transcriptError;
  return {
    student: {
      id: String(student.id),
      profile_id: userId,
      applicant_id: typeof student.applicant_id === 'string' ? student.applicant_id : null,
      student_number: String(student.student_number),
      program_id: String(student.program_id),
      admission_term_id: typeof student.admission_term_id === 'string' ? student.admission_term_id : null,
      status: String(student.status),
      enrollment_date: typeof student.enrollment_date === 'string' ? student.enrollment_date : null,
      name: profile?.full_name || 'Student',
      email: profile?.email || '',
      phone: profile?.phone || null,
      program_name: program?.name || 'Programme not assigned',
      department_name: department?.name || 'Department not assigned',
    },
    program,
    department,
    announcements,
    transcripts: (transcripts ?? []) as StudentPortalData['transcripts'],
  };
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
