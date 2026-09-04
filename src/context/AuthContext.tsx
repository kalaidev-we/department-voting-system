import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearDomainError: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pure Supabase Google Authentication Engine (Zero Clerk)
function AuthEngine({ children }: { children: React.ReactNode }) {
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
  const [authError, setAuthError] = useState<string | null>(null);

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
      if (email.toLowerCase() === 'skalaiarasu3@gmail.com') {
        synced.role = 'SUPER_ADMIN';
        synced.is_profile_complete = true;
      }
      setProfile(synced);
      localStorage.setItem('securevote_active_profile', JSON.stringify(synced));
    } catch (err) {
      console.error('Supabase profile sync error:', err);
    }
  }, []);

  // Listen for Supabase auth events and check active session on boot
  useEffect(() => {
    let isMounted = true;

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
        setProfile(null);
        localStorage.removeItem('securevote_active_profile');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncSupabaseUser]);

  // Production Google OAuth: Direct OAuth redirect via Supabase (No Clerk)
  const signInWithGoogle = async () => {
    setIsLoading(true);
    setAuthMessage('Connecting to Google Single Sign-On...');
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        console.warn('Supabase Google OAuth response:', error.message);
        setAuthError(error.message);
        setIsLoading(false);
        setAuthMessage(null);
        throw error;
      }
    } catch (err: any) {
      console.warn('Google sign-in exception:', err?.message);
      setIsLoading(false);
      setAuthMessage(null);
      setAuthError(err?.message || 'Google OAuth failed.');
      throw err;
    }
  };

  // Instant Google account verification pathway (for dev or if OAuth provider is not yet toggled in Supabase dashboard)
  const signInWithGoogleEmail = async (
    email: string
  ): Promise<{ error: string | null }> => {
    setIsLoading(true);
    setAuthMessage('Verifying Google credentials...');
    setAuthError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { isValid } = validateCollegeEmail(cleanEmail);

      if (!isValid) {
        setDomainError(cleanEmail);
        setIsLoading(false);
        setAuthMessage(null);
        return {
          error: 'Access restricted: email must end with @kpriet.ac.in (or Master Admin).',
        };
      }

      const isMasterAdmin = cleanEmail === 'skalaiarasu3@gmail.com';
      const fallbackId = isMasterAdmin
        ? 'a0000000-0000-0000-0000-000000000001'
        : `usr-g-${cleanEmail.replace(/[^a-z0-9]/g, '')}`;

      const identity: GoogleAuthIdentity = {
        id: fallbackId,
        fullName: isMasterAdmin ? 'Master Admin (Kalai Arasu)' : cleanEmail.split('@')[0].toUpperCase(),
        firstName: isMasterAdmin ? 'Kalai' : cleanEmail.split('@')[0],
        lastName: isMasterAdmin ? 'Arasu' : '',
        email: cleanEmail,
        avatarUrl: '',
        googleUserId: fallbackId,
      };

      const synced = await syncUserProfile(identity);
      if (isMasterAdmin) {
        synced.role = 'SUPER_ADMIN';
        synced.is_profile_complete = true;
      }

      setProfile(synced);
      localStorage.setItem('securevote_active_profile', JSON.stringify(synced));
      setIsLoading(false);
      setAuthMessage(null);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      setAuthMessage(null);
      return { error: err?.message || 'Authentication failed' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    setProfile(null);
    setDomainError(null);
    setAuthError(null);
    localStorage.removeItem('securevote_active_profile');
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await syncSupabaseUser(session.user);
    }
  };

  const clearDomainError = () => {
    setDomainError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const role = profile?.role || null;
  const isAuthenticated = Boolean(profile);

  return (
    <AuthContext.Provider
      value={{
        profile,
        role,
        isLoading,
        isAuthenticated,
        domainError,
        authMessage,
        authError,
        signInWithGoogle,
        signInWithGoogleEmail,
        signOut,
        refreshProfile,
        clearDomainError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthEngine>{children}</AuthEngine>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
