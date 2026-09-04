-- ============================================================================
-- SECUREVOTE CAMPUS: MIGRATION UPDATE 04 (update04.sql)
-- Fix UUID syntax errors for Clerk users & enable seamless RLS for anon/authenticated
-- ============================================================================

-- 1. EXTENSIONS & GRANTS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- 2. CANDIDATE APPLICATIONS SCHEMA FIXES
-- Drop restrictive foreign keys and convert user_id & student_id to VARCHAR so Clerk IDs (user_...) are accepted

DO $$
BEGIN
    ALTER TABLE candidate_applications DROP CONSTRAINT IF EXISTS candidate_applications_user_id_fkey;
    ALTER TABLE candidate_applications DROP CONSTRAINT IF EXISTS candidate_applications_student_id_fkey;
    ALTER TABLE candidate_applications DROP CONSTRAINT IF EXISTS candidate_applications_election_id_student_id_key;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop all existing policies on candidate_applications before altering column types
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'candidate_applications' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON candidate_applications', pol.policyname);
    END LOOP;
END $$;

-- Alter column types safely
ALTER TABLE candidate_applications ALTER COLUMN student_id TYPE VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
DO $$
BEGIN
    ALTER TABLE candidate_applications ALTER COLUMN user_id TYPE VARCHAR(255);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS roll_number VARCHAR(100);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS year VARCHAR(50);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS cgpa NUMERIC(4,2);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS election_title VARCHAR(255);
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS key_promises JSONB DEFAULT '[]'::jsonb;
ALTER TABLE candidate_applications ADD COLUMN IF NOT EXISTS symbol VARCHAR(100) DEFAULT '🛡️ Shield';

-- Enable RLS and create permissive policies for both anon (Clerk client) and authenticated
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidate_applications_select_all" ON candidate_applications 
    FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "candidate_applications_insert_all" ON candidate_applications 
    FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "candidate_applications_update_all" ON candidate_applications 
    FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "candidate_applications_delete_all" ON candidate_applications 
    FOR DELETE TO anon, authenticated USING (TRUE);

-- 3. VOTING SYSTEM RLS POLICIES (ANONYMOUS_VOTES, VOTE_LEDGER, VOTE_RECEIPTS, ELIGIBILITY)

-- A. Anonymous Votes
ALTER TABLE anonymous_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow voting insert" ON anonymous_votes;
DROP POLICY IF EXISTS "Allow viewing votes" ON anonymous_votes;
CREATE POLICY "Allow voting insert" ON anonymous_votes FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Allow viewing votes" ON anonymous_votes FOR SELECT TO anon, authenticated USING (TRUE);

-- B. Vote Ledger
ALTER TABLE vote_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow ledger insert" ON vote_ledger;
DROP POLICY IF EXISTS "Vote ledger readable" ON vote_ledger;
DROP POLICY IF EXISTS "Vote ledger readable for audit" ON vote_ledger;
CREATE POLICY "Allow ledger insert" ON vote_ledger FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Vote ledger readable" ON vote_ledger FOR SELECT TO anon, authenticated USING (TRUE);

-- C. Vote Receipts
ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    ALTER TABLE vote_receipts DROP CONSTRAINT IF EXISTS vote_receipts_student_id_fkey;
    ALTER TABLE vote_receipts ALTER COLUMN student_id TYPE VARCHAR(255);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP POLICY IF EXISTS "Allow receipt creation" ON vote_receipts;
DROP POLICY IF EXISTS "Allow receipt select" ON vote_receipts;
DROP POLICY IF EXISTS "Voter reads own receipt" ON vote_receipts;
CREATE POLICY "Allow receipt creation" ON vote_receipts FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Allow receipt select" ON vote_receipts FOR SELECT TO anon, authenticated USING (TRUE);

-- D. Election Eligibility
ALTER TABLE election_eligibility ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    ALTER TABLE election_eligibility DROP CONSTRAINT IF EXISTS election_eligibility_student_id_fkey;
    ALTER TABLE election_eligibility ALTER COLUMN student_id TYPE VARCHAR(255);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP POLICY IF EXISTS "Allow eligibility upsert" ON election_eligibility;
DROP POLICY IF EXISTS "Staff can manage eligibility" ON election_eligibility;
DROP POLICY IF EXISTS "Voters see own eligibility" ON election_eligibility;
CREATE POLICY "Allow eligibility upsert" ON election_eligibility FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- E. Candidates & Elections update counts
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Candidates update votes count" ON candidates;
CREATE POLICY "Candidates update votes count" ON candidates FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Elections update votes count" ON elections;
CREATE POLICY "Elections update votes count" ON elections FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- 4. ATOMIC CANDIDATE NOMINATION RPC FUNCTION
CREATE OR REPLACE FUNCTION submit_candidate_nomination(
    p_election_id UUID,
    p_election_title TEXT,
    p_student_id TEXT,
    p_full_name TEXT,
    p_email TEXT,
    p_department TEXT,
    p_year TEXT,
    p_cgpa NUMERIC,
    p_slogan TEXT,
    p_manifesto TEXT,
    p_key_promises JSONB,
    p_symbol TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID := gen_random_uuid();
    v_now TIMESTAMPTZ := NOW();
BEGIN
    INSERT INTO candidate_applications (
        id,
        election_id,
        election_title,
        student_id,
        roll_number,
        full_name,
        email,
        department,
        year,
        cgpa,
        slogan,
        manifesto,
        key_promises,
        symbol,
        status,
        created_at
    ) VALUES (
        v_id,
        p_election_id,
        p_election_title,
        p_student_id,
        p_student_id,
        p_full_name,
        p_email,
        p_department,
        COALESCE(p_year, '1st Year'),
        COALESCE(p_cgpa, 8.0),
        p_slogan,
        p_manifesto,
        COALESCE(p_key_promises, '[]'::jsonb),
        COALESCE(p_symbol, '🛡️ Shield'),
        'SUBMITTED',
        v_now
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'application_id', v_id,
        'status', 'SUBMITTED',
        'created_at', v_now
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_candidate_nomination TO anon, authenticated;

-- 5. CANDIDATES TABLE REPAIR & AUTOMATIC SYNC FROM APPROVED APPLICATIONS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_student_id_fkey;
    ALTER TABLE candidates ALTER COLUMN student_id TYPE VARCHAR(255);
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS department VARCHAR(255);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP POLICY IF EXISTS "candidates_select_all" ON candidates;
DROP POLICY IF EXISTS "candidates_insert_all" ON candidates;
DROP POLICY IF EXISTS "candidates_update_all" ON candidates;
DROP POLICY IF EXISTS "candidates_delete_all" ON candidates;

CREATE POLICY "candidates_select_all" ON candidates FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "candidates_insert_all" ON candidates FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "candidates_update_all" ON candidates FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "candidates_delete_all" ON candidates FOR DELETE TO anon, authenticated USING (TRUE);

-- Automatically copy all approved candidate applications into candidates table
INSERT INTO candidates (
    id,
    election_id,
    name,
    student_id,
    department,
    slogan,
    manifesto,
    photo_url,
    symbol,
    votes_count
)
SELECT 
    ca.id,
    ca.election_id,
    ca.full_name,
    ca.student_id,
    ca.department,
    ca.slogan,
    ca.manifesto,
    COALESCE(ca.photo_url, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'),
    COALESCE(ca.symbol, '🛡️ Shield'),
    0
FROM candidate_applications ca
WHERE ca.status = 'APPROVED'
AND NOT EXISTS (
    SELECT 1 FROM candidates c WHERE c.id = ca.id OR (c.election_id = ca.election_id AND c.student_id = ca.student_id)
);

-- 6. CORRECT LATERAL ENTRY STUDENTS YEAR TO 2ND YEAR
-- All lateral entry students (roll containing 'L', e.g. 26SCL01, 26SCL02, 26SCL03) are direct 2nd Year
UPDATE candidate_applications
SET year = '2nd Year'
WHERE student_id ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$'
   OR roll_number ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$'
   OR student_id ILIKE '%scl%';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        UPDATE students
        SET year = '2nd Year', admission_type = 'LATERAL'
        WHERE student_id ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$'
           OR student_id ILIKE '%scl%';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        UPDATE profiles
        SET year = '2nd Year'
        WHERE student_id ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$'
           OR student_id ILIKE '%scl%'
           OR email ~* '^[0-9]{2}[A-Za-z]{2,4}l[0-9]+@';
    END IF;
END $$;


