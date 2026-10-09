import { create } from 'zustand';
import {
  approveApplication,
  createAnnouncement,
  createDepartment,
  createProgram,
  createStaffUser,
  getStudentPortalData,
  listActivePrograms,
  listAdminStudents,
  listAnnouncements,
  listApplications,
  listDepartments,
  listPortalUsers,
  listPrograms,
  updateAnnouncementStatus,
  type Announcement,
  type ApplicationRecord,
  type Department,
  type PortalUser,
  type Program,
  type StudentPortalData,
  type StudentRecord,
} from '../lib/portalApi';

interface PortalState {
  departments: Department[];
  programs: Program[];
  students: StudentRecord[];
  applications: ApplicationRecord[];
  announcements: Announcement[];
  users: PortalUser[];
  studentPortal: StudentPortalData | null;
  isLoading: boolean;
  error: string | null;
  loadAdminData: () => Promise<void>;
  loadCatalogue: () => Promise<void>;
  loadStudents: () => Promise<void>;
  loadStudentData: (userId: string) => Promise<void>;
  loadUsers: () => Promise<void>;
  loadApplications: () => Promise<void>;
  loadAnnouncements: (includeDrafts?: boolean) => Promise<void>;
  addDepartment: (input: Pick<Department, 'code' | 'name' | 'description'>) => Promise<void>;
  addProgram: (input: Omit<Program, 'id'>) => Promise<void>;
  addAnnouncement: (input: Pick<Announcement, 'title' | 'summary' | 'body' | 'content_type' | 'status'>) => Promise<void>;
  publishAnnouncement: (id: string, status: string) => Promise<void>;
  decideApplication: (id: string, decision: 'accepted' | 'rejected' | 'waitlisted', notes?: string) => Promise<{ temporaryPassword: string | null }>;
  addStaffUser: (input: { email: string; fullName: string; password: string; role: string; phone: string }) => Promise<void>;
  clearError: () => void;
}

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export const usePortalStore = create<PortalState>((set, get) => ({
  departments: [],
  programs: [],
  students: [],
  applications: [],
  announcements: [],
  users: [],
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

  addStaffUser: async (input) => {
    try {
      await createStaffUser(input);
      await get().loadUsers();
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export { listActivePrograms };
