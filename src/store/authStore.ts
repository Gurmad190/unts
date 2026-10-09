import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type Role = 'admin' | 'student' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  systemRole?: string;
  department?: string;
  program?: string;
  status?: string;
  mustResetPassword?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const ADMIN_ROLES = new Set(['super_admin', 'admin', 'registrar', 'admissions', 'faculty', 'finance']);

let authSubscription: { unsubscribe: () => void } | null = null;
let initializationPromise: Promise<void> | null = null;
let hasInitialized = false;
let authRequestSequence = 0;

const getFriendlyError = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
};

const invalidateAuthRequests = () => {
  authRequestSequence += 1;
  return authRequestSequence;
};

const getUserFromSession = async (authUser: SupabaseUser): Promise<User | null> => {
  if (!supabase) {
    return null;
  }

  const [{ data: profile, error: profileError }, { data: roleRecords, error: roleError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('id', authUser.id)
      .maybeSingle(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (roleError) {
    throw roleError;
  }

  const databaseRoles = (roleRecords ?? [])
    .map((record) => (typeof record.role === 'string' ? record.role : null))
    .filter((role): role is string => role !== null);
  const selectedSystemRole = databaseRoles.includes('super_admin')
    ? 'super_admin'
    : databaseRoles.find((databaseRole) => ADMIN_ROLES.has(databaseRole)) ?? databaseRoles[0];
  const role: Role = databaseRoles.some((databaseRole) => ADMIN_ROLES.has(databaseRole))
    ? 'admin'
    : databaseRoles.includes('student')
      ? 'student'
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
    systemRole: selectedSystemRole,
    department: metadata.department,
    program: metadata.program,
    status: metadata.status,
    mustResetPassword: metadata.must_reset_password === true,
  };
};

const setUnauthenticated = (set: (state: Partial<AuthState>) => void, error: string | null = null) => {
  invalidateAuthRequests();
  set({ user: null, isAuthenticated: false, isLoading: false, error });
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,

  initialize: async () => {
    if (hasInitialized) {
      return;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      if (!isSupabaseConfigured || !supabase) {
        setUnauthenticated(set, 'Authentication is not configured. Add the Supabase environment variables and redeploy.');
        return;
      }

      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'INITIAL_SESSION') {
            return;
          }

          const requestId = invalidateAuthRequests();

          if (!session?.user) {
            setUnauthenticated(set);
            return;
          }

          void getUserFromSession(session.user)
            .then((user) => {
              if (requestId !== authRequestSequence) {
                return;
              }

              if (!user) {
                setUnauthenticated(set, 'Your account does not have an assigned UNS portal role.');
                return;
              }

              set({ user, isAuthenticated: true, isLoading: false, error: null });
            })
            .catch((error: unknown) => {
              if (requestId === authRequestSequence) {
                setUnauthenticated(set, getFriendlyError(error, 'We could not load your portal profile.'));
              }
            });
        });

        authSubscription = data.subscription;
      }

      const requestId = invalidateAuthRequests();
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (requestId !== authRequestSequence) {
        return;
      }

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

        if (requestId !== authRequestSequence) {
          return;
        }

        if (!user) {
          await supabase.auth.signOut();
          setUnauthenticated(set, 'Your account does not have an assigned UNS portal role.');
          return;
        }

        set({ user, isAuthenticated: true, isLoading: false, error: null });
      } catch (error: unknown) {
        if (requestId === authRequestSequence) {
          setUnauthenticated(set, getFriendlyError(error, 'We could not load your portal profile.'));
        }
      }
    })().finally(() => {
      hasInitialized = true;
      set({ isInitializing: false });
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

    const requestId = invalidateAuthRequests();

    try {
      const user = await getUserFromSession(data.user);

      if (requestId !== authRequestSequence) {
        return false;
      }

      if (!user) {
        await supabase.auth.signOut();
        setUnauthenticated(set, 'Your account does not have an assigned UNS portal role.');
        return false;
      }

      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (profileError: unknown) {
      if (requestId !== authRequestSequence) {
        return false;
      }

      await supabase.auth.signOut();
      setUnauthenticated(set, getFriendlyError(profileError, 'We could not load your portal profile.'));
      return false;
    }
  },

  requestPasswordReset: async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      set({ error: 'Authentication is not configured. Add the Supabase environment variables and redeploy.' });
      return false;
    }

    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login?recovery=1`,
    });

    if (error) {
      set({ isLoading: false, error: getFriendlyError(error, 'We could not send a password reset email.') });
      return false;
    }

    set({ isLoading: false, error: null });
    return true;
  },

  updatePassword: async (password) => {
    if (!isSupabaseConfigured || !supabase) {
      set({ error: 'Authentication is not configured. Add the Supabase environment variables and redeploy.' });
      return false;
    }

    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_reset_password: false },
    });

    if (error) {
      set({ isLoading: false, error: getFriendlyError(error, 'We could not update your password.') });
      return false;
    }

    set({ isLoading: false, error: null });
    return true;
  },

  logout: async () => {
    invalidateAuthRequests();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });

    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // The local session is already cleared; a later refresh will reconcile with Supabase.
    }
  },

  clearError: () => set({ error: null }),
}));
