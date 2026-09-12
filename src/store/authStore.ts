import { create } from 'zustand';

export type Role = 'admin' | 'student' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  program?: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const MOCK_USERS: Record<string, User> = {
  'admin@uns.edu': {
    id: 'a1',
    name: 'System Admin',
    email: 'admin@uns.edu',
    role: 'admin',
  },
  'student@uns.edu': {
    id: 's1',
    name: 'Faaduma Axmed Cali',
    email: 'student@uns.edu',
    role: 'student',
    department: 'Technology & Data Science',
    program: 'BSc Computer Science',
    status: 'Active',
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {
    if (password === 'password123' && MOCK_USERS[email]) {
      set({ user: MOCK_USERS[email], isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
