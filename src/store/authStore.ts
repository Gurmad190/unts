import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

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
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const ADMIN_ROLES = new Set(['super_admin', 'admin', 'registrar', 'admissions', 'finance']);

let authSubscription: { unsubscribe: () => void } | null = null;
let initializationPromise: Promise<void> | null = null;

const getFriendlyError = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const getUserFromSession = async (authUser: SupabaseUser): Promise<User | null> => {
  if (!supabase) {
    return null;
  }

  const [{ data: profile, error: profileError }, { data: roleRecord, error: roleError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('id', authUser.id)
      .maybeSingle(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (roleError) {
    throw roleError;
  }

  const databaseRole = typeof roleRecord?.role === 'string' ? roleRecord.role : null;
  const role: Role = databaseRole === 'student'
    ? 'student'
    : databaseRole && ADMIN_ROLES.has(databaseRole)
      ? 'admin'
      : null;

  if (!role) {
    return null;
  }

  const metadata = authUser.user_metadata ?? {};

  return {
    id: authUser.id,
    name: profile?.full_name || metadata.full_name || authUser.email || 'UNS User',
    email: profile?.email || authUser.email || '',
    role,
    department: metadata.department,
    program: metadata.program,
    status: metadata.status,
  };
};

const setUnauthenticated = (set: (state: Partial<AuthState>) => void, error: string | null = null) => {
  set({ user: null, isAuthenticated: false, isLoading: false, error });
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    if (get().isLoading && initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      if (!isSupabaseConfigured || !supabase) {
        setUnauthenticated(set, 'Authentication is not configured. Add the Supabase environment variables and redeploy.');
        return;
      }

      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!session?.user) {
            setUnauthenticated(set);
            return;
          }

          void getUserFromSession(session.user)
            .then((user) => {
              if (!user) {
                setUnauthenticated(set, 'Your account does not have an assigned UNS portal role.');
                return;
              }

              set({ user, isAuthenticated: true, isLoading: false, error: null });
            })
            .catch((error: unknown) => {
              setUnauthenticated(set, getFriendlyError(error, 'We could not load your portal profile.'));
            });
        });

        authSubscription = data.subscription;
      }

      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error) {
        setUnauthenticated(set, getFriendlyError(error, 'We could not restore your session.'));
        return;
      }

      if (!sessionData.session?.user) {
        setUnauthenticated(set);
        return;
      }

      try {
        const user = await getUserFromSession(sessionData.session.user);

        if (!user) {
          await supabase.auth.signOut();
          setUnauthenticated(set, 'Your account does not have an assigned UNS portal role.');
          return;
        }

        set({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch (error: unknown) {
        setUnauthenticated(set, getFriendlyError(error, 'We could not load your portal profile.'));
      }
    })().finally(() => {
      initializationPromise = null;
    });

    return initializationPromise;
  },

  login: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      set({ error: 'Authentication is not configured. Add the Supabase environment variables and redeploy.' });
      return false;
    }

    set({ isLoading: true, error: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      set({ isLoading: false, error: 'Invalid email or password.' });
      return false;
    }

    try {
      const user = await getUserFromSession(data.user);

      if (!user) {
        await supabase.auth.signOut();
        setUnauthenticated(set, 'Your account does not have an assigned UNS portal role.');
        return false;
      }

      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (profileError: unknown) {
      await supabase.auth.signOut();
      setUnauthenticated(set, getFriendlyError(profileError, 'We could not load your portal profile.'));
      return false;
    }
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
