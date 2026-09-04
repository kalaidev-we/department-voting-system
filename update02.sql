-- ====================================================================
-- SECUREVOTE CAMPUS — UPDATE 02 MIGRATION SCRIPT (update02.sql)
-- Complete Database Handling for Student Candidate Applications & Voting
-- ====================================================================

-- 1. ENABLE EXTENSIONS & PERMISSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 2. ENHANCE CANDIDATE APPLICATIONS TABLE
-- Add comprehensive fields to store full student nomination details
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS roll_number VARCHAR(100);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS year VARCHAR(50);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS cgpa NUMERIC(4,2);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS election_title VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS key_promises JSONB DEFAULT '[]'::jsonb;
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Relax foreign key constraints on student_id so roll numbers or profile IDs are both accepted
DO $$
BEGIN
    ALTER TABLE candidate_applications DROP CONSTRAINT IF EXISTS candidate_applications_student_id_fkey;
    ALTER TABLE candidate_applications DROP CONSTRAINT IF EXISTS candidate_applications_election_id_student_id_key;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE candidate_applications ALTER COLUMN student_id TYPE VARCHAR(255);

-- 3. ENHANCE VOTING TABLES (ANONYMOUS_VOTES, VOTE_LEDGER, VOTE_RECEIPTS, ELIGIBILITY)

-- A. Anonymous Votes: Ensure both integrity_hash and vote_hash are supported
ALTER TABLE anonymous_votes ADD COLUMN IF NOT EXISTS vote_hash TEXT;
ALTER TABLE anonymous_votes ADD COLUMN IF NOT EXISTS cast_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE anonymous_votes ALTER COLUMN integrity_hash DROP NOT NULL;

-- B. Candidates & Elections: Ensure votes_count defaults properly
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS votes_count INT DEFAULT 0;
ALTER TABLE elections ADD COLUMN IF NOT EXISTS votes_count INT DEFAULT 0;

-- C. Election Eligibility: Ensure voter participation columns exist
ALTER TABLE election_eligibility ADD COLUMN IF NOT EXISTS is_eligible BOOLEAN DEFAULT TRUE;
ALTER TABLE election_eligibility ADD COLUMN IF NOT EXISTS has_voted BOOLEAN DEFAULT FALSE;
ALTER TABLE election_eligibility ADD COLUMN IF NOT EXISTS voted_at TIMESTAMPTZ;

-- D. Vote Receipts: Ensure receipt hash, code, and election references exist
ALTER TABLE vote_receipts ADD COLUMN IF NOT EXISTS verification_code VARCHAR(32);
ALTER TABLE vote_receipts ADD COLUMN IF NOT EXISTS receipt_hash VARCHAR(128);
ALTER TABLE vote_receipts ADD COLUMN IF NOT EXISTS election_title VARCHAR(255);
ALTER TABLE vote_receipts ADD COLUMN IF NOT EXISTS candidate_name VARCHAR(255);

DO $$
BEGIN
    ALTER TABLE vote_receipts DROP CONSTRAINT IF EXISTS vote_receipts_student_id_fkey;
    ALTER TABLE vote_receipts ADD CONSTRAINT vote_receipts_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES FOR CANDIDATE APPLICATIONS & VOTING

-- Candidate Applications: Allow students to apply, staff to review
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applications readable by authenticated" ON candidate_applications;
DROP POLICY IF EXISTS "Applications visible to owner and staff" ON candidate_applications;
CREATE POLICY "Applications readable by authenticated" ON candidate_applications 
FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Students can create applications" ON candidate_applications;
CREATE POLICY "Students can create applications" ON candidate_applications 
FOR INSERT TO authenticated WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Staff and admin can manage applications" ON candidate_applications;
CREATE POLICY "Staff and admin can manage applications" ON candidate_applications 
FOR ALL TO authenticated 
USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
)
WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Anonymous Votes: Allow authenticated voters to cast ballots
ALTER TABLE anonymous_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow voting insert" ON anonymous_votes;
CREATE POLICY "Allow voting insert" ON anonymous_votes 
FOR INSERT TO authenticated WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow viewing votes" ON anonymous_votes;
CREATE POLICY "Allow viewing votes" ON anonymous_votes 
FOR SELECT TO authenticated USING (TRUE);

-- Vote Ledger: Immutable public blockchain audit
ALTER TABLE vote_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow ledger insert" ON vote_ledger;
CREATE POLICY "Allow ledger insert" ON vote_ledger 
FOR INSERT TO authenticated WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Vote ledger readable" ON vote_ledger;
DROP POLICY IF EXISTS "Vote ledger readable for audit" ON vote_ledger;
CREATE POLICY "Vote ledger readable" ON vote_ledger 
FOR SELECT TO anon, authenticated USING (TRUE);

-- Vote Receipts: Authenticated can generate and view their receipts
ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow receipt creation" ON vote_receipts;
CREATE POLICY "Allow receipt creation" ON vote_receipts 
FOR INSERT TO authenticated WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Allow receipt select" ON vote_receipts;
DROP POLICY IF EXISTS "Voter reads own receipt" ON vote_receipts;
CREATE POLICY "Allow receipt select" ON vote_receipts 
FOR SELECT TO authenticated USING (TRUE);

-- Election Eligibility: Allow voter participation tracking
ALTER TABLE election_eligibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow eligibility upsert" ON election_eligibility;
DROP POLICY IF EXISTS "Staff can manage eligibility" ON election_eligibility;
DROP POLICY IF EXISTS "Voters see own eligibility" ON election_eligibility;
CREATE POLICY "Allow eligibility upsert" ON election_eligibility 
FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Candidates & Elections: Allow vote count increment
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Candidates update votes count" ON candidates;
CREATE POLICY "Candidates update votes count" ON candidates 
FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Elections update votes count" ON elections;
CREATE POLICY "Elections update votes count" ON elections 
FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- 5. ATOMIC VOTING RPC FUNCTION (submit_vote)
-- Performs double-voting validation, anonymous ballot creation, ledger block chaining,
-- voter receipt issuance, eligibility marking, and counter updates in a single atomic transaction.

CREATE OR REPLACE FUNCTION submit_vote(
    p_election_id UUID,
    p_candidate_id UUID,
    p_student_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_election RECORD;
    v_candidate RECORD;
    v_voter_uuid UUID;
    v_last_ledger RECORD;
    v_seq_num BIGINT := 1;
    v_prev_hash TEXT;
    v_ballot_hash TEXT;
    v_block_hash TEXT;
    v_verify_code VARCHAR(32);
    v_receipt_hash VARCHAR(128);
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- 1. Resolve Voter UUID from input (supports UUID or student roll number or email)
    IF p_student_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        v_voter_uuid := p_student_id::uuid;
    ELSE
        SELECT id INTO v_voter_uuid FROM profiles 
        WHERE student_id = p_student_id OR email = p_student_id LIMIT 1;
        
        IF v_voter_uuid IS NULL THEN
            v_voter_uuid := auth.uid();
        END IF;
    END IF;

    IF v_voter_uuid IS NULL THEN
        RAISE EXCEPTION 'Voter profile could not be identified';
    END IF;

    -- 2. Validate Election
    SELECT * INTO v_election FROM elections WHERE id = p_election_id FOR SHARE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Election not found';
    END IF;

    -- 3. Check for Double Voting (in eligibility or receipts)
    IF EXISTS (
        SELECT 1 FROM election_eligibility 
        WHERE election_id = p_election_id AND student_id = v_voter_uuid AND has_voted = TRUE
    ) OR EXISTS (
        SELECT 1 FROM vote_receipts 
        WHERE election_id = p_election_id AND student_id = v_voter_uuid
    ) THEN
        RAISE EXCEPTION 'You have already cast your vote in this election.';
    END IF;

    -- 4. Validate Candidate
    SELECT * INTO v_candidate FROM candidates WHERE id = p_candidate_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Selected candidate not found';
    END IF;

    -- 5. Prepare Cryptographic Ledger Block Hashes (SHA-256 via pgcrypto)
    SELECT * INTO v_last_ledger FROM vote_ledger
    WHERE election_id = p_election_id
    ORDER BY sequence_number DESC LIMIT 1;

    IF FOUND THEN
        v_seq_num := v_last_ledger.sequence_number + 1;
        v_prev_hash := v_last_ledger.block_hash;
    ELSE
        v_seq_num := 1;
        v_prev_hash := encode(digest((p_election_id::text || '-GENESIS')::bytea, 'sha256'), 'hex');
    END IF;

    v_ballot_hash := encode(digest((gen_random_uuid()::text || p_candidate_id::text || v_now::text)::bytea, 'sha256'), 'hex');
    v_block_hash := encode(digest((v_prev_hash || v_ballot_hash || v_seq_num::text)::bytea, 'sha256'), 'hex');
    v_verify_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
    v_receipt_hash := 'KPR-' || extract(year from v_now)::text || '-VOTE-' || v_verify_code;

    -- 6. Insert Anonymous Vote (Strictly decoupled from voter identity)
    INSERT INTO anonymous_votes (election_id, candidate_id, integrity_hash, vote_hash, cast_at)
    VALUES (p_election_id, p_candidate_id, v_ballot_hash, v_ballot_hash, v_now);

    -- 7. Insert Cryptographic Ledger Block
    INSERT INTO vote_ledger (election_id, sequence_number, ballot_hash, previous_hash, block_hash, timestamp)
    VALUES (p_election_id, v_seq_num, v_ballot_hash, v_prev_hash, v_block_hash, v_now);

    -- 8. Issue Verifiable Digital Receipt
    INSERT INTO vote_receipts (receipt_hash, election_id, student_id, verification_code, election_title, candidate_name, created_at)
    VALUES (v_receipt_hash, p_election_id, v_voter_uuid, v_verify_code, v_election.title, v_candidate.name, v_now)
    ON CONFLICT (election_id, student_id) DO UPDATE
    SET receipt_hash = EXCLUDED.receipt_hash, verification_code = EXCLUDED.verification_code;

    -- 9. Mark Voter Participation in Eligibility Table
    INSERT INTO election_eligibility (election_id, student_id, is_eligible, has_voted, voted_at)
    VALUES (p_election_id, v_voter_uuid, TRUE, TRUE, v_now)
    ON CONFLICT (election_id, student_id) DO UPDATE
    SET has_voted = TRUE, voted_at = v_now;

    -- 10. Increment Candidate and Election Aggregates
    UPDATE candidates SET votes_count = COALESCE(votes_count, 0) + 1, updated_at = v_now WHERE id = p_candidate_id;
    UPDATE elections SET votes_count = COALESCE(votes_count, 0) + 1, updated_at = v_now WHERE id = p_election_id;

    -- Return full receipt payload to client
    RETURN jsonb_build_object(
        'success', TRUE,
        'receipt_id', v_receipt_hash,
        'verification_code', v_verify_code,
        'timestamp', v_now,
        'sequence_number', v_seq_num,
        'ledger_hash', v_block_hash
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION submit_vote(UUID, UUID, TEXT) TO anon, authenticated;

-- Overload for UUID student_id
CREATE OR REPLACE FUNCTION submit_vote(
    p_election_id UUID,
    p_candidate_id UUID,
    p_student_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN submit_vote(p_election_id, p_candidate_id, p_student_id::text);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_vote(UUID, UUID, UUID) TO anon, authenticated;

-- ====================================================================
-- END OF UPDATE02.SQL
-- ====================================================================
