import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rewhbcfmcvriulagkqhy.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G4-wJHQn-LwBvk_HGbGllw_gB7i3fDK';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility functions for student database queries
export async function findStudentByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('college_email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      console.warn('Supabase query error (or RLS restriction):', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to lookup student in Supabase:', err);
    return null;
  }
}

export async function getActiveElections() {
  try {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase elections error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Failed to fetch elections:', err);
    return [];
  }
}
