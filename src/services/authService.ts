import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface GoogleAuthIdentity {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  googleUserId: string;
}

export function extractGoogleIdentity(user: User): GoogleAuthIdentity {
  const meta = user.user_metadata || {};
  const email = user.email || '';
  const fullName = meta.full_name || meta.name || email.split('@')[0];
  
  const nameParts = fullName.trim().split(' ');
  const firstName = meta.given_name || nameParts[0] || '';
  const lastName = meta.family_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
  const avatarUrl = meta.avatar_url || meta.picture || '';
  const googleUserId = meta.sub || user.id;

  return {
    id: user.id,
    fullName,
    firstName,
    lastName,
    email,
    avatarUrl,
    googleUserId,
  };
}

export async function signInWithGoogleOAuth(): Promise<{ error: Error | null }> {
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
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

export async function signOutAuth(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err };
  }
}

export async function getCurrentSession(): Promise<{ session: Session | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  } catch (err: any) {
    return { session: null, error: err };
  }
}
