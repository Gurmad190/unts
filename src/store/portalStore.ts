import { create } from 'zustand';
import {
  approveApplication,
  createAcademicTerm,
  createAnnouncement,
  createCourse,
  createDepartment,
  createProgram,
  createStaffUser,
  enrollStudentInTerm,
  getStudentPortalData,
  listAcademicTerms,
  listActivePrograms,
  listAdminStudents,
  listAnnouncements,
  listApplications,
  listAuditLogs,
  listCourses,
  listDepartments,
  listPortalUsers,
  listPrograms,
  setApplicationStatus,
  setCurrentTerm,
  updateAnnouncementStatus,
  updateCourseStatus,
  updatePortalUser,
  updateStudentStatus,
  type AcademicTerm,
  type Announcement,
  type ApplicationRecord,
  type AuditLog,
  type Course,
  type Department,
  type PortalUser,
  type Program,
  type StudentPortalData,
  type StudentRecord,
} from '../lib/portalApi';

interface PortalState {
  departments: Department[];
  programs: Program[];
  courses: Course[];
  terms: AcademicTerm[];
  students: StudentRecord[];
  applications: ApplicationRecord[];
  announcements: Announcement[];
  users: PortalUser[];
  auditLogs: AuditLog[];
  studentPortal: StudentPortalData | null;
  isLoading: boolean;
  error: string | null;
  loadAdminData: () => Promise<void>;
  loadCatalogue: () => Promise<void>;
  loadCourses: () => Promise<void>;
  loadTerms: () => Promise<void>;
  loadAuditLogs: () => Promise<void>;
  loadStudents: () => Promise<void>;
  loadStudentData: (userId: string) => Promise<void>;
  loadUsers: () => Promise<void>;
  loadApplications: () => Promise<void>;
  loadAnnouncements: (includeDrafts?: boolean) => Promise<void>;
  addDepartment: (input: Pick<Department, 'code' | 'name' | 'description'>) => Promise<void>;
  addProgram: (input: Omit<Program, 'id'>) => Promise<void>;
  addCourse: (input: Omit<Course, 'id' | 'department_name' | 'program_name'>) => Promise<void>;
  toggleCourse: (id: string, active: boolean) => Promise<void>;
  addTerm: (input: Pick<AcademicTerm, 'name' | 'code' | 'starts_on' | 'ends_on' | 'is_current'>) => Promise<void>;
  activateTerm: (id: string) => Promise<void>;
  addAnnouncement: (input: Pick<Announcement, 'title' | 'summary' | 'body' | 'content_type' | 'status'>) => Promise<void>;
  publishAnnouncement: (id: string, status: string) => Promise<void>;
  decideApplication: (id: string, decision: 'accepted' | 'rejected' | 'waitlisted', notes?: string) => Promise<{ temporaryPassword: string | null }>;
  setApplicationWorkflowStatus: (id: string, status: 'new' | 'review' | 'withdrawn', notes?: string) => Promise<void>;
  updateStudentRecordStatus: (id: string, status: 'active' | 'graduated' | 'suspended' | 'withdrawn' | 'inactive') => Promise<void>;
  enrollStudent: (studentId: string, termId: string) => Promise<void>;
  addStaffUser: (input: { email: string; fullName: string; password: string; role: string; phone: string }) => Promise<void>;
  updateUser: (input: { userId: string; fullName: string; phone: string; role: string }) => Promise<void>;
  clearError: () => void;
}

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export const usePortalStore = create<PortalState>((set, get) => ({
  departments: [],
  programs: [],
  courses: [],
  terms: [],
  students: [],
  applications: [],
  announcements: [],
  users: [],
  auditLogs: [],
  studentPortal: null,
  isLoading: false,
  error: null,

  loadAdminData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [departments, programs, students, applications, announcements] = await Promise.all([
        listDepartments(),
        listPrograms(),
        listAdminStudents(),
        listApplications(),
        listAnnouncements(true),
      ]);
      set({ departments, programs, students, applications, announcements, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadCatalogue: async () => {
    set({ isLoading: true, error: null });
    try {
      const [departments, programs] = await Promise.all([listDepartments(), listPrograms()]);
      set({ departments, programs, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ courses: await listCourses(), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadTerms: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ terms: await listAcademicTerms(), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadAuditLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ auditLogs: await listAuditLogs(), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ students: await listAdminStudents(), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadStudentData: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const studentPortal = await getStudentPortalData(userId);
      set({ studentPortal, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ users: await listPortalUsers(), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ applications: await listApplications(), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  loadAnnouncements: async (includeDrafts = false) => {
    set({ isLoading: true, error: null });
    try {
      set({ announcements: await listAnnouncements(includeDrafts), isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: errorMessage(error) });
    }
  },

  addDepartment: async (input) => {
    try {
      const department = await createDepartment(input);
      set((state) => ({ departments: [...state.departments, department] }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  addProgram: async (input) => {
    try {
      const program = await createProgram(input);
      set((state) => ({ programs: [...state.programs, program] }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  addCourse: async (input) => {
    try {
      const course = await createCourse(input);
      set((state) => ({ courses: [...state.courses, course] }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  toggleCourse: async (id, active) => {
    try {
      const course = await updateCourseStatus(id, active);
      set((state) => ({ courses: state.courses.map((item) => item.id === id ? course : item) }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },


  addTerm: async (input) => {
    try {
      const term = await createAcademicTerm(input);
      set((state) => ({ terms: [...state.terms, term].sort((a, b) => b.starts_on.localeCompare(a.starts_on)) }));
      if (input.is_current) await get().activateTerm(term.id);
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  activateTerm: async (id) => {
    try {
      const activeTerm = await setCurrentTerm(id);
      set((state) => ({ terms: state.terms.map((term) => ({ ...term, is_current: term.id === activeTerm.id })) }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  addAnnouncement: async (input) => {
    try {
      const announcement = await createAnnouncement(input);
      set((state) => ({ announcements: [announcement, ...state.announcements] }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  publishAnnouncement: async (id, status) => {
    try {
      const announcement = await updateAnnouncementStatus(id, status);
      set((state) => ({ announcements: state.announcements.map((item) => item.id === id ? announcement : item) }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  decideApplication: async (id, decision, notes) => {
    try {
      const result = await approveApplication(id, decision, notes);
      await get().loadApplications();
      return { temporaryPassword: result.temporaryPassword };
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  setApplicationWorkflowStatus: async (id, status, notes) => {
    try {
      await setApplicationStatus(id, status, notes);
      await get().loadApplications();
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  updateStudentRecordStatus: async (id, status) => {
    try {
      await updateStudentStatus(id, status);
      set((state) => ({ students: state.students.map((student) => student.id === id ? { ...student, status } : student) }));
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  enrollStudent: async (studentId, termId) => {
    try {
      await enrollStudentInTerm(studentId, termId);
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  addStaffUser: async (input) => {
    try {
      await createStaffUser(input);
      await get().loadUsers();
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  updateUser: async (input) => {
    try {
      await updatePortalUser(input);
      await get().loadUsers();
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export { listActivePrograms };
