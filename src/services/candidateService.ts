import { supabase } from '../lib/supabase';
import { CandidateApplication } from '../lib/types';

export async function fetchCandidateApplications(): Promise<CandidateApplication[]> {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as any;
    }
  } catch (err) {
    console.warn('Applications table fetch fallback:', err);
  }

  const stored = localStorage.getItem('candidate_applications');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  return [];
}

export async function submitCandidateApplication(payload: Omit<CandidateApplication, 'id' | 'status' | 'submitted_at'>): Promise<{ success: boolean; data?: CandidateApplication; error?: string }> {
  const newApp: CandidateApplication = {
    ...payload,
    id: `app-${Date.now()}`,
    status: 'SUBMITTED',
    submitted_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('candidate_applications').insert([{
      election_id: newApp.election_id,
      student_id: newApp.student_id,
      slogan: newApp.slogan,
      manifesto: newApp.manifesto,
      status: 'SUBMITTED',
    }]).select().single();

    if (!error && data) {
      // Success from db
    }
  } catch (err) {
    console.warn('Candidate application DB insert fallback:', err);
  }

  // Update local storage cache
  const list = await fetchCandidateApplications();
  const updated = [newApp, ...list];
  localStorage.setItem('candidate_applications', JSON.stringify(updated));

  return { success: true, data: newApp };
}

export async function reviewApplication(
  applicationId: string,
  newStatus: 'APPROVED' | 'REJECTED',
  reviewNotes: string,
  reviewerName: string
): Promise<{ success: boolean }> {
  try {
    await supabase
      .from('candidate_applications')
      .update({
        status: newStatus,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);
  } catch (err) {
    console.warn('DB update application fallback:', err);
  }

  const list = await fetchCandidateApplications();
  const updated = list.map((app) =>
    app.id === applicationId
      ? {
          ...app,
          status: newStatus,
          review_notes: reviewNotes,
          reviewed_by: reviewerName,
        }
      : app
  );
  localStorage.setItem('candidate_applications', JSON.stringify(updated));

  return { success: true };
}
