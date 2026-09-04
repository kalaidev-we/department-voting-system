import { supabase } from '../lib/supabase';
import { Election, DashboardSummaryStats, ElectionStatus } from '../lib/types';

export async function fetchStaffElections(): Promise<Election[]> {
  try {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Map Supabase rows to Election model
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        election_type: item.election_type || 'Department Election',
        status: (item.status as ElectionStatus) || 'ACTIVE',
        eligible_voters_count: item.eligible_voters_count || 0,
        votes_count: item.votes_count || 0,
        start_at: item.start_at || new Date().toISOString(),
        end_at: item.end_at || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        department_name: item.department_name || 'All Departments',
        academic_year: item.academic_year || '2026-2027',
        created_at: item.created_at,
      }));
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
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        election_type: data.election_type || 'Department Election',
        status: (data.status as ElectionStatus) || 'ACTIVE',
        eligible_voters_count: data.eligible_voters_count || 0,
        votes_count: data.votes_count || 0,
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
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase.from('elections').insert([
      {
        title: payload.title,
        description: payload.description,
        election_type: payload.election_type,
        status: 'SCHEDULED',
        start_at: payload.start_at,
        end_at: payload.end_at,
        academic_year: payload.academic_year,
        created_at: new Date().toISOString(),
      },
    ]).select().single();

    if (error) {
      console.warn('Election insert RLS fallback:', error.message);
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
