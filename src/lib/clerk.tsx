import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';

export const ALLOWED_DOMAIN = '@kpriet.ac.in';

export function isAllowedCollegeDomain(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN);
}

export interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: {
    id: string;
    fullName: string;
    primaryEmailAddress?: { emailAddress: string };
    imageUrl?: string;
  } | null;
  signOut: () => Promise<void>;
  signInWithGoogle: (simulatedEmail?: string) => Promise<{ success: boolean; reason?: string }>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isLoaded: false,
  user: null,
  signOut: async () => {},
  signInWithGoogle: async () => ({ success: false }),
  isMockMode: false,
});

export const useAuth = () => useContext(AuthContext);

// Component using real Clerk when publishable key is present
function RealClerkBridge({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut, openSignIn } = useClerk();

  const user = clerkUser
    ? {
        id: clerkUser.id,
        fullName: clerkUser.fullName || clerkUser.firstName || 'Student',
        primaryEmailAddress: clerkUser.primaryEmailAddress
          ? { emailAddress: clerkUser.primaryEmailAddress.emailAddress }
          : undefined,
        imageUrl: clerkUser.imageUrl,
      }
    : null;

  const signInWithGoogle = async () => {
    try {
      await openSignIn({
        fallbackRedirectUrl: window.location.origin,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, reason: err.message };
    }
  };

  const signOut = async () => {
    await clerkSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!isSignedIn,
        isLoaded,
        user,
        signOut,
        signInWithGoogle,
        isMockMode: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Mock auth provider for instant local testing and previewing domain validation
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    fullName: string;
    primaryEmailAddress: { emailAddress: string };
    imageUrl?: string;
  } | null>(() => {
    const saved = localStorage.getItem('securevote_mock_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const signInWithGoogle = async (simulatedEmail?: string) => {
    const email = simulatedEmail || 'arun.kumar.22cs@kpriet.ac.in';
    const mockUser = {
      id: 'usr_mock_' + Math.random().toString(36).substring(2, 9),
      fullName: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      primaryEmailAddress: { emailAddress: email },
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    localStorage.setItem('securevote_mock_user', JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    return { success: true };
  };

  const signOut = async () => {
    localStorage.removeItem('securevote_mock_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: !!currentUser,
        isLoaded,
        user: currentUser,
        signOut,
        signInWithGoogle,
        isMockMode: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();

  if (clerkPubKey && clerkPubKey.startsWith('pk_')) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <RealClerkBridge>{children}</RealClerkBridge>
      </ClerkProvider>
    );
  }

  return <MockAuthProvider>{children}</MockAuthProvider>;
}
