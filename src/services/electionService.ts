import { supabase } from '../lib/supabase';
import { Election, DashboardSummaryStats, ElectionStatus } from '../lib/types';

export async function fetchStaffElections(): Promise<Election[]> {
  try {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Query database for true registered student count
      let trueRegisteredVoters = 0;
      try {
        const [{ count: studentCount }, { count: profileCount }] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
        ]);
        trueRegisteredVoters = Math.max(studentCount || 0, profileCount || 0);
      } catch {
        // Ignore
      }

      // Map Supabase rows with exact live database vote counts
      return await Promise.all(
        data.map(async (item: any) => {
          let trueVotes = item.votes_count || 0;
          try {
            const [{ count: ledgerCount }, { count: anonCount }] = await Promise.all([
              supabase.from('vote_ledger').select('*', { count: 'exact', head: true }).eq('election_id', item.id),
              supabase.from('anonymous_votes').select('*', { count: 'exact', head: true }).eq('election_id', item.id),
            ]);
            trueVotes = Math.max(trueVotes, ledgerCount || 0, anonCount || 0);
          } catch {
            // Ignore
          }

          const trueElectorate =
            item.eligible_voters_count > 0 && item.eligible_voters_count !== 23
              ? item.eligible_voters_count
              : Math.max(trueRegisteredVoters, trueVotes, 1);

          return {
            id: item.id,
            title: item.title,
            description: item.description || '',
            election_type: item.election_type || 'Department Election',
            status: (item.status as ElectionStatus) || 'ACTIVE',
            eligible_voters_count: trueElectorate,
            votes_count: trueVotes,
            start_at: item.start_at || new Date().toISOString(),
            end_at: item.end_at || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            department_name: item.department_name || 'All Departments',
            academic_year: item.academic_year || '2026-2027',
            created_at: item.created_at,
          };
        })
      );
    }
    if (error) {
      console.error('Error fetching elections from Supabase:', error.message);
    }
  } catch (err) {
    console.error('Failed to query elections table:', err);
  }

  return [];
}

export async function fetchElectionById(id: string): Promise<Election | null> {
  try {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      let trueVotes = data.votes_count || 0;
      let trueRegistered = 0;
      try {
        const [{ count: ledgerCount }, { count: anonCount }, { count: studCount }, { count: profCount }] =
          await Promise.all([
            supabase.from('vote_ledger').select('*', { count: 'exact', head: true }).eq('election_id', id),
            supabase.from('anonymous_votes').select('*', { count: 'exact', head: true }).eq('election_id', id),
            supabase.from('students').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
          ]);
        trueVotes = Math.max(trueVotes, ledgerCount || 0, anonCount || 0);
        trueRegistered = Math.max(studCount || 0, profCount || 0);
      } catch {
        // Ignore
      }

      const electorate =
        data.eligible_voters_count > 0 && data.eligible_voters_count !== 23
          ? data.eligible_voters_count
          : Math.max(trueRegistered, trueVotes, 1);

      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        election_type: data.election_type || 'Department Election',
        status: (data.status as ElectionStatus) || 'ACTIVE',
        eligible_voters_count: electorate,
        votes_count: trueVotes,
        start_at: data.start_at || new Date().toISOString(),
        end_at: data.end_at || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        department_name: data.department_name || 'All Departments',
        academic_year: data.academic_year || '2026-2027',
        created_at: data.created_at,
      };
    }
  } catch (err) {
    console.error('Error fetching election by id:', err);
  }
  return null;
}

export function computeSummaryStats(elections: Election[]): DashboardSummaryStats {
  const activeElection = elections.find((e) => e.status === 'ACTIVE') || elections[0];
  if (!activeElection) {
    return {
      eligibleVoters: 0,
      votesCast: 0,
      participationRate: 0,
    };
  }

  const eligibleVoters = activeElection.eligible_voters_count || 0;
  const votesCast = activeElection.votes_count || 0;
  const participationRate =
    eligibleVoters > 0 ? parseFloat(((votesCast / eligibleVoters) * 100).toFixed(1)) : 0;

  return {
    eligibleVoters,
    votesCast,
    participationRate,
  };
}

export async function createElection(payload: {
  title: string;
  description: string;
  election_type: string;
  start_at: string;
  end_at: string;
  academic_year: string;
  department_name?: string;
  status?: ElectionStatus;
  eligible_voters_count?: number;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const insertPayload: any = {
      title: payload.title,
      description: payload.description || '',
      election_type: payload.election_type,
      status: payload.status || 'ACTIVE',
      start_at: payload.start_at,
      end_at: payload.end_at,
      academic_year: payload.academic_year || '2026-2027',
      department_name: payload.department_name || 'All Departments',
      eligible_voters_count: payload.eligible_voters_count || 0,
      votes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optionally set created_by from active session
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      insertPayload.created_by = user.id;
    }

    const { data, error } = await supabase
      .from('elections')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating election:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to create election:', err);
    return { success: false, error: err.message || 'Failed to create election' };
  }
}

export async function updateElection(
  id: string,
  payload: Partial<Election>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updateFields: any = {
      ...payload,
      updated_at: new Date().toISOString(),
    };
    delete updateFields.id; // Do not overwrite ID

    const { data, error } = await supabase
      .from('elections')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating election:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('Failed to update election:', err);
    return { success: false, error: err.message || 'Failed to update election' };
  }
}

export async function updateElectionStatus(
  id: string,
  status: ElectionStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('elections')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error changing election status:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update election status:', err);
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

export async function deleteElection(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Primary Attempt: Use RPC delete_election_cascade (Security Definer - runs as admin)
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('delete_election_cascade', {
        p_election_id: id,
      });
      if (!rpcErr && rpcData && rpcData.success) {
        return { success: true };
      }
    } catch {
      // Proceed to direct table fallback
    }

    // 2. Proactively clean up dependent rows to prevent foreign key errors
    await Promise.allSettled([
      supabase.from('election_eligibility').delete().eq('election_id', id),
      supabase.from('candidate_applications').delete().eq('election_id', id),
      supabase.from('candidates').delete().eq('election_id', id),
      supabase.from('election_staff_assignments').delete().eq('election_id', id),
      supabase.from('election_results').delete().eq('election_id', id),
      supabase.from('anonymous_votes').delete().eq('election_id', id),
      supabase.from('vote_ledger').delete().eq('election_id', id),
      supabase.from('vote_receipts').delete().eq('election_id', id),
    ]);

    // 3. Delete the election row
    const { data, error } = await supabase
      .from('elections')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting election:', error.message);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn('Election delete returned 0 affected rows. Executing force delete via RPC.');
      const { error: forceErr } = await supabase.rpc('delete_election_cascade', {
        p_election_id: id,
      });
      if (forceErr) {
        return { success: false, error: forceErr.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete election:', err);
    return { success: false, error: err.message || 'Failed to delete election' };
  }
}
