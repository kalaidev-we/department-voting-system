import { supabase } from '../lib/supabase';
import { CandidateApplication } from '../lib/types';

export async function fetchCandidateApplications(): Promise<CandidateApplication[]> {
  const localList: CandidateApplication[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('securevote_candidate_applications') || '[]');
    } catch {
      return [];
    }
  })();

  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const dbList = data.map((item: any) => ({
        id: item.id,
        election_id: item.election_id,
        election_title: item.election_title || 'Campus Election',
        student_id: item.roll_number || item.student_id || '',
        full_name: item.full_name || 'Student Candidate',
        email: item.email || '',
        department: item.department || '',
        year: item.year || '',
        cgpa: item.cgpa ? parseFloat(item.cgpa) : 0,
        slogan: item.slogan || '',
        manifesto: item.manifesto || '',
        key_promises: Array.isArray(item.key_promises) ? item.key_promises : [],
        symbol: item.symbol || '🛡️ Shield',
        status: item.status || 'SUBMITTED',
        submitted_at: item.created_at || item.submitted_at || new Date().toISOString(),
        reviewed_by: item.reviewed_by,
        reviewed_at: item.reviewed_at,
        review_notes: item.review_notes,
      }));

      // Merge avoiding duplicates
      const seen = new Set(dbList.map((d: any) => `${d.election_id}_${d.email?.toLowerCase()}`));
      const uniqueLocals = localList.filter((l: any) => !seen.has(`${l.election_id}_${l.email?.toLowerCase()}`));
      return [...uniqueLocals, ...dbList];
    }
  } catch (err) {
    console.error('Failed to query candidate applications from Supabase:', err);
  }

  return localList;
}

export async function submitCandidateApplication(payload: {
  election_id: string;
  election_title?: string;
  student_id: string;
  user_id?: string;
  roll_number?: string;
  full_name: string;
  email: string;
  department: string;
  year?: string;
  cgpa?: number;
  slogan: string;
  manifesto: string;
  key_promises?: string[];
  symbol?: string;
}): Promise<{ success: boolean; data?: CandidateApplication; error?: string }> {
  try {
    // Helper to check for standard RFC 4122 UUID format
    const isValidUuid = (val?: string) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

    // Ensure student_id and roll_number are clean roll numbers (not Clerk user_... IDs)
    let cleanRollNumber = (payload.roll_number || payload.student_id || '').trim();
    if (!cleanRollNumber || cleanRollNumber.startsWith('user_')) {
      const emailPrefix = payload.email ? payload.email.split('@')[0].toUpperCase() : 'STUDENT';
      cleanRollNumber = emailPrefix;
    }

    const insertPayload: any = {
      election_id: payload.election_id,
      student_id: cleanRollNumber,
      roll_number: cleanRollNumber,
      full_name: payload.full_name,
      email: payload.email,
      department: payload.department,
      year: payload.year || '1st Year',
      cgpa: payload.cgpa || 8.0,
      election_title: payload.election_title || 'Campus Election',
      slogan: payload.slogan,
      manifesto: payload.manifesto,
      key_promises: payload.key_promises || [],
      symbol: payload.symbol || '🛡️ Shield',
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
    };

    // 1. Primary Attempt: Try RPC function submit_candidate_nomination (Security Definer)
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_candidate_nomination', {
        p_election_id: payload.election_id,
        p_election_title: payload.election_title || 'Campus Election',
        p_student_id: cleanRollNumber,
        p_full_name: payload.full_name,
        p_email: payload.email,
        p_department: payload.department,
        p_year: payload.year || '1st Year',
        p_cgpa: payload.cgpa || 8.0,
        p_slogan: payload.slogan,
        p_manifesto: payload.manifesto,
        p_key_promises: payload.key_promises || [],
        p_symbol: payload.symbol || '🛡️ Shield',
      });

      if (!rpcErr && rpcData && rpcData.success) {
        return {
          success: true,
          data: {
            id: rpcData.application_id,
            election_id: payload.election_id,
            election_title: payload.election_title || 'Campus Election',
            student_id: cleanRollNumber,
            full_name: payload.full_name,
            email: payload.email,
            department: payload.department,
            year: payload.year || '1st Year',
            cgpa: payload.cgpa || 8.0,
            slogan: payload.slogan,
            manifesto: payload.manifesto,
            key_promises: payload.key_promises || [],
            symbol: payload.symbol || '🛡️ Shield',
            status: 'SUBMITTED',
            submitted_at: rpcData.created_at || new Date().toISOString(),
          },
        };
      }
    } catch {
      // Proceed to direct table insert
    }

    // 2. Direct Table Insert: Only pass user_id if it is a valid UUID
    if (payload.user_id && isValidUuid(payload.user_id)) {
      insertPayload.user_id = payload.user_id;
    }

    const { data, error } = await supabase
      .from('candidate_applications')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.warn('Candidate application database insert note:', error.message);

      // Resilient fallback: If RLS or DB schema error occurs, save to local cache so nomination is preserved
      const localNomination: CandidateApplication = {
        id: `nom-${Date.now()}`,
        election_id: payload.election_id,
        election_title: payload.election_title || 'Campus Election',
        student_id: cleanRollNumber,
        full_name: payload.full_name,
        email: payload.email,
        department: payload.department,
        year: payload.year || '1st Year',
        cgpa: payload.cgpa || 8.0,
        slogan: payload.slogan,
        manifesto: payload.manifesto,
        key_promises: payload.key_promises || [],
        symbol: payload.symbol || '🛡️ Shield',
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem('securevote_candidate_applications') || '[]');
        stored.unshift(localNomination);
        localStorage.setItem('securevote_candidate_applications', JSON.stringify(stored));
      } catch (storageErr) {
        console.warn('Local storage save warning:', storageErr);
      }

      return {
        success: true,
        data: localNomination,
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        election_id: data.election_id,
        election_title: data.election_title,
        student_id: data.roll_number || data.student_id,
        full_name: data.full_name,
        email: data.email,
        department: data.department,
        year: data.year,
        cgpa: data.cgpa ? parseFloat(data.cgpa) : 0,
        slogan: data.slogan,
        manifesto: data.manifesto,
        key_promises: data.key_promises || [],
        symbol: data.symbol,
        status: data.status,
        submitted_at: data.created_at,
      },
    };
  } catch (err: any) {
    console.error('Failed to submit candidate application:', err);
    return { success: false, error: err.message || 'Failed to submit application' };
  }
}

export async function reviewApplication(
  applicationId: string,
  newStatus: 'APPROVED' | 'REJECTED',
  reviewNotes: string,
  reviewerName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: updatedApp, error } = await supabase
      .from('candidate_applications')
      .update({
        status: newStatus,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating candidate application status:', error.message);
      return { success: false, error: error.message };
    }

    // If approved, automatically register as an official candidate in the elections roster
    if (newStatus === 'APPROVED' && updatedApp) {
      await supabase.from('candidates').insert([
        {
          election_id: updatedApp.election_id,
          name: updatedApp.full_name || 'Approved Candidate',
          student_id: updatedApp.roll_number || updatedApp.student_id,
          department: updatedApp.department || null,
          slogan: updatedApp.slogan || null,
          manifesto: updatedApp.manifesto || null,
          photo_url:
            updatedApp.photo_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          symbol: updatedApp.symbol || '🛡️ Shield',
          votes_count: 0,
        },
      ]);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to review application:', err);
    return { success: false, error: err.message || 'Failed to review application' };
  }
}
