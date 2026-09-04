import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClerkProvider, useUser, useClerk, useSignIn } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../lib/types';
import { GoogleAuthIdentity } from '../services/authService';
import { syncUserProfile } from '../services/profileService';
import { validateCollegeEmail } from '../lib/domainValidator';

export interface AuthContextType {
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  domainError: string | null;
  authMessage: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearDomainError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Production Auth Engine connected to Clerk and Supabase
function AuthEngine({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { signIn: clerkSignIn } = useSignIn();

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('securevote_active_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Helper to load and sync a Supabase authenticated user
  const syncSupabaseUser = useCallback(async (user: any) => {
    const email = user.email || '';
    const { isValid } = validateCollegeEmail(email);

    if (!isValid) {
      setDomainError(email || 'unauthorized@gmail.com');
      await supabase.auth.signOut();
      setProfile(null);
      localStorage.removeItem('securevote_active_profile');
      return;
    }

    setDomainError(null);
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || meta.name || email.split('@')[0];
    const nameParts = fullName.trim().split(' ');

    const identity: GoogleAuthIdentity = {
      id: user.id,
      fullName,
      firstName: meta.first_name || meta.given_name || nameParts[0] || '',
      lastName: meta.last_name || meta.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''),
      email,
      avatarUrl: meta.avatar_url || meta.picture || '',
      googleUserId: user.id,
    };

    try {
      const synced = await syncUserProfile(identity);
      setProfile(synced);
      localStorage.setItem('securevote_active_profile', JSON.stringify(synced));
    } catch (err) {
      console.error('Supabase profile sync error:', err);
    }
  }, []);

  // 1. Listen for Supabase session changes and check active session
  useEffect(() => {
    let isMounted = true;

    // Check active Supabase session on startup
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        await syncSupabaseUser(session.user);
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        await syncSupabaseUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        if (!isClerkSignedIn) {
          setProfile(null);
          localStorage.removeItem('securevote_active_profile');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncSupabaseUser, isClerkSignedIn]);

  // 2. Synchronize Clerk user whenever Clerk authentication changes
  useEffect(() => {
    if (!isClerkLoaded) return;

    async function syncClerkAuth() {
      if (isClerkSignedIn && clerkUser) {
        const email = clerkUser.primaryEmailAddress?.emailAddress || '';
        const { isValid } = validateCollegeEmail(email);

        // Strict Domain Enforcement: Only @kpriet.ac.in or Master Admin permitted
        if (!isValid) {
          setDomainError(email || 'unauthorized@gmail.com');
          if (clerkSignOut) await clerkSignOut();
          setProfile(null);
          localStorage.removeItem('securevote_active_profile');
          setIsLoading(false);
          return;
        }

        setDomainError(null);
        setAuthMessage('Verifying college credentials (@kpriet.ac.in)...');

        const identity: GoogleAuthIdentity = {
          id: clerkUser.id,
          fullName: clerkUser.fullName || clerkUser.firstName || email.split('@')[0],
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          email: email,
          avatarUrl: clerkUser.imageUrl || '',
          googleUserId: clerkUser.id,
        };

        try {
          const synced = await syncUserProfile(identity);
          setProfile(synced);
          localStorage.setItem('securevote_active_profile', JSON.stringify(synced));
        } catch (e) {
          console.error('Profile sync error:', e);
        } finally {
          setIsLoading(false);
          setAuthMessage(null);
        }
      }
    }

    syncClerkAuth();
  }, [isClerkLoaded, isClerkSignedIn, clerkUser, clerkSignOut]);

  // Production Google OAuth: Direct SSO redirect
  const signInWithGoogle = async () => {
    setIsLoading(true);
    setAuthMessage('Redirecting to Google Secure Login...');
    try {
      if (clerkSignIn) {
        await clerkSignIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: `${window.location.origin}/sso-callback`,
          redirectUrlComplete: window.location.origin,
        });
        return;
      }

      // Fallback direct to Supabase Google OAuth
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
    } catch (err: any) {
      console.warn('Google sign-in redirect note:', err?.message);
      setIsLoading(false);
      setAuthMessage(null);
    }
  };

  // Production Email & Password Authentication (for Master Admin & Faculty)
  const signInWithEmailPassword = async (
    email: string,
    pass: string
  ): Promise<{ error: string | null }> => {
    setIsLoading(true);
    setAuthMessage('Verifying credentials...');
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { isValid } = validateCollegeEmail(cleanEmail);

      if (!isValid) {
        setIsLoading(false);
        setAuthMessage(null);
        return {
          error: 'Access restricted: email must end with @kpriet.ac.in (or Master Admin).',
        };
      }

      // Master Admin credentials check
      const isMasterAdmin = cleanEmail === 'skalaiarasu3@gmail.com' && pass === 'Kalai@125';

      let authUser: any = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (!error && data?.user) {
          authUser = data.user;
        }
      } catch (e) {
        console.warn('Supabase signIn catch:', e);
      }

      if (authUser) {
        await syncSupabaseUser(authUser);
        setIsLoading(false);
        setAuthMessage(null);
        return { error: null };
      }

      // If Supabase GoTrue encounters schema issue, allow verified Master Admin access
      if (isMasterAdmin) {
        const masterIdentity: GoogleAuthIdentity = {
          id: 'a0000000-0000-0000-0000-000000000001',
          fullName: 'Master Admin (Kalai Arasu)',
          firstName: 'Kalai',
          lastName: 'Arasu',
          email: 'skalaiarasu3@gmail.com',
          avatarUrl: '',
          googleUserId: 'a0000000-0000-0000-0000-000000000001',
        };
        const synced = await syncUserProfile(masterIdentity);
        synced.role = 'SUPER_ADMIN';
        synced.is_profile_complete = true;
        setProfile(synced);
        localStorage.setItem('securevote_active_profile', JSON.stringify(synced));
        setIsLoading(false);
        setAuthMessage(null);
        return { error: null };
      }

      setIsLoading(false);
      setAuthMessage(null);
      return { error: 'Invalid email or password. Please verify credentials.' };
    } catch (err: any) {
      setIsLoading(false);
      setAuthMessage(null);
      return { error: err?.message || 'Authentication failed' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (clerkSignOut) await clerkSignOut();
      await supabase.auth.signOut();
    } catch (e) {
      // Ignored
    }
    setProfile(null);
    setDomainError(null);
    localStorage.removeItem('securevote_active_profile');
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const identity: GoogleAuthIdentity = {
        id: clerkUser.id,
        fullName: clerkUser.fullName || email.split('@')[0],
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        email,
        avatarUrl: clerkUser.imageUrl || '',
        googleUserId: clerkUser.id,
      };
      const synced = await syncUserProfile(identity);
      setProfile(synced);
      localStorage.setItem('securevote_active_profile', JSON.stringify(synced));
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncSupabaseUser(session.user);
      }
    }
  };

  const clearDomainError = () => {
    setDomainError(null);
  };

  const role = profile?.role || null;
  const isAuthenticated = Boolean(profile);

  return (
    <AuthContext.Provider
      value={{
        profile,
        role,
        isLoading: isClerkLoaded ? isLoading : true,
        isAuthenticated,
        domainError,
        authMessage,
        signInWithGoogle,
        signInWithEmailPassword,
        signOut,
        refreshProfile,
        clearDomainError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clerkPubKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    'pk_test_cmVuZXdpbmctc3RhcmxpbmctODYuY2xlcmsuYWNjb3VudHMuZGV2JA';

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AuthEngine>{children}</AuthEngine>
    </ClerkProvider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
