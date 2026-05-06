import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { UserProfile } from '@/types';

// ─── State Shape ────────────────────────────────────────────────────────────

interface AuthState {
  user: UserProfile | null;
  session: ReturnType<typeof Object> | null; // Supabase Session
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Local profile persistence ──────────────────────────────────────────────

const MOCK_USER_KEY = 'dhansathi_mock_user';

function saveMockUser(user: UserProfile) {
  try {
    sessionStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  } catch { /* ignore */ }
}

export function loadSavedUserProfile(): UserProfile | null {
  try {
    const raw = sessionStorage.getItem(MOCK_USER_KEY) || localStorage.getItem(MOCK_USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function loadMockUser(): UserProfile | null {
  return loadSavedUserProfile();
}

function clearMockUser() {
  try {
    sessionStorage.removeItem(MOCK_USER_KEY);
    localStorage.removeItem(MOCK_USER_KEY);
  } catch { /* ignore */ }
}

function mergeWithSavedProfile(profile: UserProfile | null): UserProfile | null {
  const saved = loadSavedUserProfile();
  if (!profile) return saved;
  if (!saved) return profile;
  if (saved.id !== profile.id && saved.email !== profile.email) return profile;

  return {
    ...profile,
    phone: saved.phone ?? profile.phone,
    date_of_birth: saved.date_of_birth ?? profile.date_of_birth,
    gender: saved.gender ?? profile.gender,
    state: saved.state ?? profile.state,
    district: saved.district ?? profile.district,
    pincode: saved.pincode ?? profile.pincode,
    category: saved.category ?? profile.category,
    occupation: saved.occupation ?? profile.occupation,
    annual_income: saved.annual_income ?? profile.annual_income,
    is_bpl: saved.is_bpl ?? profile.is_bpl,
    full_name: saved.full_name || profile.full_name,
    plan: saved.plan || profile.plan,
    onboarding_completed: saved.onboarding_completed ?? profile.onboarding_completed,
    updated_at: saved.updated_at || profile.updated_at,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[authStore] Failed to fetch profile:', error.message);
    return null;
  }

  return data as UserProfile;
}

// ─── Store ──────────────────────────────────────────────────────────────────

// Auto-hydrate mock user on store creation (synchronous)
const _hydratedMockUser = loadMockUser();

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State — pre-loaded from sessionStorage in mock mode
  user: _hydratedMockUser,
  session: _hydratedMockUser ? ({ user: _hydratedMockUser } as any) : null,
  loading: isSupabaseConfigured && !_hydratedMockUser, // only loading if we need to check Supabase
  initialized: !isSupabaseConfigured || Boolean(_hydratedMockUser), // local profile can hydrate immediately

  // ── Initialize ──────────────────────────────────────────────────────────

  initialize: async () => {
    try {
      set({ loading: true });

      // Mock mode: restore user from sessionStorage
      if (!isSupabaseConfigured) {
        const mockUser = loadMockUser();
        set({
          user: mockUser,
          session: mockUser ? ({ user: mockUser } as any) : null,
          loading: false,
          initialized: true,
        });
        return;
      }

      // Real Supabase mode
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[authStore] getSession error:', error.message);
        set({ user: null, session: null, loading: false, initialized: true });
        return;
      }

      if (session?.user) {
        let profile = mergeWithSavedProfile(await fetchProfile(session.user.id));
        // Fallback: if profile doesn't exist in DB, check local storage
        if (!profile) {
          const localUser = loadMockUser();
          if (localUser && localUser.email === session.user.email) {
            profile = localUser;
          } else {
            // Create a minimal profile from auth data
            profile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              plan: 'free',
              onboarding_completed: false,
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            saveMockUser(profile);
          }
        }
        if (profile) saveMockUser(profile);
        set({
          user: profile,
          session,
          loading: false,
          initialized: true,
        });
      } else {
        set({ user: null, session: null, loading: false, initialized: true });
      }

      // Listen for auth state changes going forward
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession?.user) {
          set({ user: null, session: null });
          return;
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          const profile = mergeWithSavedProfile(await fetchProfile(newSession.user.id));
          if (profile) saveMockUser(profile);
          set({ user: profile, session: newSession as any });
        }
      });
    } catch (err) {
      console.error('[authStore] Initialization failed/skipped:', err);
      // Try to restore mock user even on error
      const mockUser = loadMockUser();
      set({
        user: mockUser,
        session: mockUser ? ({ user: mockUser } as any) : null,
        loading: false,
        initialized: true,
      });
    }
  },

  // ── Sign Up ─────────────────────────────────────────────────────────────

  signUp: async (email, password, fullName) => {
    set({ loading: true });

    // Mock mode: skip Supabase entirely
    if (!isSupabaseConfigured) {
      const mockUser: UserProfile = {
        id: 'mock-user-' + Date.now(),
        email,
        full_name: fullName,
        plan: 'pro',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveMockUser(mockUser);
      set({ user: mockUser, session: { user: mockUser } as any, loading: false });
      return;
    }

    // Real Supabase mode
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      // On ANY signup error (rate limit, user exists, etc.) → try signing in automatically
      console.warn('[authStore] signUp error, attempting auto sign-in:', error.message);
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError && signInData.session && signInData.user) {
          let profile = mergeWithSavedProfile(await fetchProfile(signInData.user.id));
          if (!profile) {
            profile = {
              id: signInData.user.id,
              email: signInData.user.email || email,
              full_name: fullName || email.split('@')[0],
              plan: 'free',
              onboarding_completed: false,
              created_at: signInData.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            saveMockUser(profile);
          }
          saveMockUser(profile);
          set({ user: profile, session: signInData.session as any, loading: false });
          return;
        }
      } catch { /* sign-in also failed, fall through */ }

      // Sign-in also failed → fall back to local mock user so user is never blocked
      console.warn('[authStore] Both signUp and signIn failed, falling back to local mock user');
      const mockUser: UserProfile = {
        id: 'mock-user-' + Date.now(),
        email,
        full_name: fullName,
        plan: 'free',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveMockUser(mockUser);
      set({ user: mockUser, session: { user: mockUser } as any, loading: false });
      return;
    }

    if (data.session && data.user) {
      let profile = mergeWithSavedProfile(await fetchProfile(data.user.id));
      if (!profile) {
        profile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName || email.split('@')[0],
          plan: 'free',
          onboarding_completed: false,
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        saveMockUser(profile);
      }
      saveMockUser(profile);
      set({ user: profile, session: data.session as any, loading: false });
    } else if (data.user && !data.session) {
      // User created but email confirmation pending — auto sign-in attempt
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError && signInData.session) {
          let profile = mergeWithSavedProfile(await fetchProfile(signInData.user.id));
          if (!profile) {
            profile = {
              id: signInData.user.id,
              email: signInData.user.email || email,
              full_name: fullName || email.split('@')[0],
              plan: 'free',
              onboarding_completed: false,
              created_at: signInData.user.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            saveMockUser(profile);
          }
          saveMockUser(profile);
          set({ user: profile, session: signInData.session as any, loading: false });
          return;
        }
      } catch { /* ignore, fall through */ }

      // Can't sign in either → fall back to mock user
      const mockUser: UserProfile = {
        id: 'mock-user-' + Date.now(),
        email,
        full_name: fullName,
        plan: 'free',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveMockUser(mockUser);
      set({ user: mockUser, session: { user: mockUser } as any, loading: false });
    } else {
      set({ loading: false });
    }
  },

  // ── Sign In ─────────────────────────────────────────────────────────────

  signIn: async (email, password) => {
    set({ loading: true });

    // Mock mode: skip Supabase entirely
    if (!isSupabaseConfigured) {
      // Check if there's an existing mock user with this email
      const existing = loadMockUser();
      const mockUser: UserProfile = existing && existing.email === email
        ? existing
        : {
          id: 'mock-user-' + Date.now(),
          email,
          full_name: email.split('@')[0],
          plan: 'pro',
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      saveMockUser(mockUser);
      set({ user: mockUser, session: { user: mockUser } as any, loading: false });
      return;
    }

    // Real Supabase mode
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      throw new Error(error.message);
    }

    let profile = mergeWithSavedProfile(await fetchProfile(data.user.id));
    if (!profile) {
      profile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.email?.split('@')[0] || 'User',
        plan: 'free',
        onboarding_completed: false,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    saveMockUser(profile);
    set({ user: profile, session: data.session as any, loading: false });
  },

  // ── Google OAuth ────────────────────────────────────────────────────────

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured) {
      // Mock mode: simulate Google sign-in
      const mockUser: UserProfile = {
        id: 'mock-user-google-' + Date.now(),
        email: 'google.user@gmail.com',
        full_name: 'Google User',
        plan: 'pro',
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveMockUser(mockUser);
      set({ user: mockUser, session: { user: mockUser } as any, loading: false });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  // ── Sign Out ────────────────────────────────────────────────────────────

  signOut: async () => {
    set({ loading: true });

    // Mock mode: just clear state
    if (!isSupabaseConfigured) {
      clearMockUser();
      set({ user: null, session: null, loading: false });
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      set({ loading: false });
      throw new Error(error.message);
    }

    clearMockUser();
    set({ user: null, session: null, loading: false });
  },

  // ── Update Profile ──────────────────────────────────────────────────────

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    const updatedFields = { ...updates, updated_at: new Date().toISOString() };

    // Mock mode: update in-memory and sessionStorage
    if (!isSupabaseConfigured || user.id.startsWith('mock-user-')) {
      const updatedUser: UserProfile = { ...user, ...updatedFields };
      saveMockUser(updatedUser);
      set({ user: updatedUser });
      return;
    }

    // Real Supabase mode — use upsert so it works even if profile row doesn't exist yet
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, ...updatedFields }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('[authStore] Supabase profile save failed, falling back to local:', error.message);
      // Fallback: save to local sessionStorage so settings persist locally
      const updatedUser: UserProfile = { ...user, ...updatedFields };
      saveMockUser(updatedUser);
      set({ user: updatedUser });
      return;
    }

    const savedUser = data as UserProfile;
    saveMockUser(savedUser);
    set({ user: savedUser });
  },

  // ── Set User (manual override) ──────────────────────────────────────────

  setUser: (user) => {
    if (user) {
      saveMockUser(user);
    }
    set({ user });
  },
}));

// ─── Derived selectors ──────────────────────────────────────────────────────

/** True when auth has been initialized and user exists */
export const selectIsAuthenticated = (state: AuthStore) =>
  state.initialized && state.user !== null;

/** True when user exists but hasn't completed onboarding */
export const selectNeedsOnboarding = (state: AuthStore) =>
  state.user !== null && !state.user.onboarding_completed;
