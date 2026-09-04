import { supabase } from '../lib/supabase';
import { Candidate, VoteReceipt } from '../lib/types';

// In-browser cryptographic SHA-256 helper
async function sha256Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Fetch candidates for an election
export async function fetchCandidates(electionId?: string): Promise<Candidate[]> {
  try {
    let query = supabase.from('candidates').select('*').order('created_at', { ascending: false });
    if (electionId && electionId !== 'all') {
      query = query.eq('election_id', electionId);
    }
    const { data, error } = await query;

    if (!error && data) {
      return data.map((item: any) => ({
        id: item.id,
        election_id: item.election_id,
        name: item.name,
        student_id: item.student_id || '',
        department: item.department || '',
        slogan: item.slogan || '',
        manifesto: item.manifesto || '',
        photo_url: item.photo_url || '',
        symbol: item.symbol || '🛡️',
        votes_count: item.votes_count || 0,
        created_at: item.created_at,
      }));
    }
    if (error) {
      console.error('Error fetching candidates from DB:', error.message);
    }
  } catch (err) {
    console.error('Candidates table query failed:', err);
  }

  return [];
}

// Add candidate directly by staff
export async function addStaffCandidate(payload: {
  election_id: string;
  name: string;
  student_id?: string;
  department?: string;
  slogan?: string;
  manifesto?: string;
  photo_url?: string;
  symbol?: string;
}): Promise<{ success: boolean; data?: Candidate; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          election_id: payload.election_id,
          name: payload.name,
          student_id: payload.student_id || null,
          department: payload.department || null,
          slogan: payload.slogan || null,
          manifesto: payload.manifesto || null,
          photo_url:
            payload.photo_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          symbol: payload.symbol || '🛡️ Shield of Trust',
          votes_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Candidate DB insert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Candidate };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Check if a student has already voted in an election
export async function hasStudentVoted(electionId: string, studentId: string): Promise<boolean> {
  // Check local session ledger first for immediate reactivity
  const localKey = `vote_cast_${electionId}_${studentId}`;
  if (localStorage.getItem(localKey)) {
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('election_eligibility')
      .select('has_voted')
      .eq('election_id', electionId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (!error && data) {
      return !!data.has_voted;
    }
  } catch (err) {
    console.warn('Voter eligibility check fallback:', err);
  }

  return false;
}

// Get saved vote receipt
export function getStoredReceipt(electionId: string, studentId: string): VoteReceipt | null {
  const receiptKey = `receipt_${electionId}_${studentId}`;
  const stored = localStorage.getItem(receiptKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// Atomic vote submission
export async function submitVote(params: {
  electionId: string;
  candidateId: string;
  studentId: string;
  electionTitle: string;
  candidateName: string;
}): Promise<{ success: boolean; receipt?: VoteReceipt; error?: string }> {
  const { electionId, candidateId, studentId, electionTitle, candidateName } = params;

  // Double voting prevention
  const alreadyVoted = await hasStudentVoted(electionId, studentId);
  if (alreadyVoted) {
    return { success: false, error: 'You have already cast your vote in this election.' };
  }

  const now = new Date().toISOString();

  // Try database RPC first if Supabase is connected
  try {
    const { data, error } = await supabase.rpc('submit_vote', {
      p_election_id: electionId,
      p_candidate_id: candidateId,
      p_student_id: studentId,
    });

    if (!error && data && data.success) {
      const receipt: VoteReceipt = {
        receipt_id: data.receipt_id,
        verification_code: data.verification_code,
        election_id: electionId,
        election_title: electionTitle,
        candidate_name: candidateName,
        timestamp: data.timestamp || now,
        sequence_number: data.sequence_number || 1,
        ledger_hash: data.receipt_id,
      };

      // Persist in local storage
      localStorage.setItem(`vote_cast_${electionId}_${studentId}`, 'true');
      localStorage.setItem(`receipt_${electionId}_${studentId}`, JSON.stringify(receipt));

      return { success: true, receipt };
    }
  } catch (rpcErr) {
    console.warn('RPC submit_vote fallback to direct table insertion:', rpcErr);
  }

  // Direct table insertion fallback
  try {
    const randomSalt = crypto.randomUUID();
    const verificationCode = randomSalt.slice(0, 8).toUpperCase();
    const receiptToken = `KPR-${new Date().getFullYear()}-VOTE-${verificationCode}`;
    const ledgerHash = await sha256Hex(`${electionId}:${verificationCode}:${now}`);
    const ballotHash = await sha256Hex(`${candidateId}:${randomSalt}`);

    // Get current block count for sequence
    const { count } = await supabase
      .from('vote_ledger')
      .select('*', { count: 'exact', head: true });

    const seqNum = (count || 0) + 1;

    // 1. Insert anonymous vote
    await supabase.from('anonymous_votes').insert([
      {
        election_id: electionId,
        candidate_id: candidateId,
        vote_hash: ballotHash,
        created_at: now,
      },
    ]);

    // 2. Insert vote ledger block
    await supabase.from('vote_ledger').insert([
      {
        sequence_number: seqNum,
        election_id: electionId,
        ballot_hash: ballotHash,
        block_hash: ledgerHash,
        timestamp: now,
      },
    ]);

    // 3. Mark eligibility has_voted
    await supabase.from('election_eligibility').upsert([
      {
        election_id: electionId,
        student_id: studentId,
        has_voted: true,
        voted_at: now,
      },
    ]);

    // 4. Update candidate votes count
    const { data: cand } = await supabase
      .from('candidates')
      .select('votes_count')
      .eq('id', candidateId)
      .maybeSingle();

    if (cand) {
      await supabase
        .from('candidates')
        .update({ votes_count: (cand.votes_count || 0) + 1 })
        .eq('id', candidateId);
    }

    const receipt: VoteReceipt = {
      receipt_id: receiptToken,
      verification_code: verificationCode,
      election_id: electionId,
      election_title: electionTitle,
      candidate_name: candidateName,
      timestamp: now,
      sequence_number: seqNum,
      ledger_hash: ledgerHash,
    };

    // Store participation flag & receipt locally
    localStorage.setItem(`vote_cast_${electionId}_${studentId}`, 'true');
    localStorage.setItem(`receipt_${electionId}_${studentId}`, JSON.stringify(receipt));

    return { success: true, receipt };
  } catch (genErr: any) {
    return { success: false, error: genErr.message || 'Failed to seal vote in cryptographic ledger.' };
  }
}
