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

-- 1B. PROFILES TABLE COMPATIBILITY & REAL DATA COLUMNS
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department_name VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS year VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_batch VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS section VARCHAR(10);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_anon_select" ON profiles;
DROP POLICY IF EXISTS "profiles_anon_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_anon_update" ON profiles;
CREATE POLICY "profiles_anon_select" ON profiles FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "profiles_anon_insert" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "profiles_anon_update" ON profiles FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- 1C. STUDENTS TABLE RLS & ELIGIBLE VOTER PERMISSIONS
ALTER TABLE students ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS department_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS year VARCHAR(50) DEFAULT '1st Year';
ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_batch VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_type VARCHAR(50) DEFAULT 'REGULAR';
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_eligible_to_vote BOOLEAN DEFAULT TRUE;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_anon_select" ON students;
DROP POLICY IF EXISTS "students_anon_insert" ON students;
DROP POLICY IF EXISTS "students_anon_update" ON students;
CREATE POLICY "students_anon_select" ON students FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "students_anon_insert" ON students FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "students_anon_update" ON students FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- 1D. ELECTION ELIGIBILITY TABLE RLS
ALTER TABLE election_eligibility ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "election_eligibility_anon_select" ON election_eligibility;
DROP POLICY IF EXISTS "election_eligibility_anon_insert" ON election_eligibility;
DROP POLICY IF EXISTS "election_eligibility_anon_update" ON election_eligibility;
CREATE POLICY "election_eligibility_anon_select" ON election_eligibility FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "election_eligibility_anon_insert" ON election_eligibility FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "election_eligibility_anon_update" ON election_eligibility FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- 1E. RPC: AUTOMATIC VOTER REGISTRATION ON USER SIGNUP (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION register_student_voter(
    p_profile_id UUID,
    p_student_id VARCHAR(50),
    p_full_name VARCHAR(255),
    p_email VARCHAR(255),
    p_department VARCHAR(255),
    p_year VARCHAR(50),
    p_batch VARCHAR(100),
    p_admission_type VARCHAR(50) DEFAULT 'REGULAR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_el RECORD;
BEGIN
    -- 1. Ensure student profile is complete in profiles
    UPDATE profiles
    SET 
        full_name = COALESCE(p_full_name, full_name),
        student_id = COALESCE(p_student_id, student_id),
        department_name = COALESCE(p_department, department_name),
        year = COALESCE(p_year, year),
        academic_batch = COALESCE(p_batch, academic_batch),
        is_active = TRUE,
        is_profile_complete = TRUE,
        updated_at = NOW()
    WHERE id = p_profile_id OR email = LOWER(p_email);

    -- 2. Upsert into students table with eligible to vote flag
    INSERT INTO students (
        id,
        student_id,
        full_name,
        email,
        department_name,
        year,
        academic_batch,
        admission_type,
        is_eligible_to_vote,
        created_at,
        updated_at
    )
    VALUES (
        p_profile_id,
        p_student_id,
        p_full_name,
        LOWER(p_email),
        p_department,
        COALESCE(p_year, '1st Year'),
        COALESCE(p_batch, 'Batch of 2026'),
        COALESCE(p_admission_type, 'REGULAR'),
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (student_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        department_name = EXCLUDED.department_name,
        year = EXCLUDED.year,
        academic_batch = EXCLUDED.academic_batch,
        admission_type = EXCLUDED.admission_type,
        is_eligible_to_vote = TRUE,
        updated_at = NOW();

    -- 3. Automatically register voter in all active elections
    FOR v_el IN SELECT id FROM elections WHERE status = 'ACTIVE' LOOP
        INSERT INTO election_eligibility (
            election_id,
            student_id,
            is_eligible,
            has_voted,
            created_at
        )
        VALUES (
            v_el.id,
            p_profile_id,
            TRUE,
            FALSE,
            NOW()
        )
        ON CONFLICT (election_id, student_id) DO UPDATE SET
            is_eligible = TRUE;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'student_id', p_student_id,
        'profile_id', p_profile_id,
        'is_eligible_to_vote', TRUE
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION register_student_voter TO anon, authenticated;

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
DROP POLICY IF EXISTS "elections_select_all" ON elections;
DROP POLICY IF EXISTS "elections_insert_all" ON elections;
DROP POLICY IF EXISTS "elections_update_all" ON elections;
DROP POLICY IF EXISTS "elections_delete_all" ON elections;

CREATE POLICY "elections_select_all" ON elections FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "elections_insert_all" ON elections FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "elections_update_all" ON elections FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "elections_delete_all" ON elections FOR DELETE TO anon, authenticated USING (TRUE);

-- Cascading delete permissions for all related tables
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'election_results') THEN
        ALTER TABLE election_results ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "election_results_all" ON election_results;
        CREATE POLICY "election_results_all" ON election_results FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'election_staff_assignments') THEN
        ALTER TABLE election_staff_assignments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "election_staff_assignments_all" ON election_staff_assignments;
        CREATE POLICY "election_staff_assignments_all" ON election_staff_assignments FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vote_ledger') THEN
        ALTER TABLE vote_ledger ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "vote_ledger_delete_all" ON vote_ledger;
        CREATE POLICY "vote_ledger_delete_all" ON vote_ledger FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'anonymous_votes') THEN
        ALTER TABLE anonymous_votes ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "anonymous_votes_delete_all" ON anonymous_votes;
        CREATE POLICY "anonymous_votes_delete_all" ON anonymous_votes FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vote_receipts') THEN
        ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "vote_receipts_delete_all" ON vote_receipts;
        CREATE POLICY "vote_receipts_delete_all" ON vote_receipts FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
    END IF;
END $$;

-- CASCADE DELETE RPC FUNCTION (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION delete_election_cascade(p_election_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM election_eligibility WHERE election_id = p_election_id;
    DELETE FROM candidate_applications WHERE election_id = p_election_id;
    DELETE FROM candidates WHERE election_id = p_election_id;
    DELETE FROM election_staff_assignments WHERE election_id = p_election_id;
    DELETE FROM election_results WHERE election_id = p_election_id;
    DELETE FROM anonymous_votes WHERE election_id = p_election_id;
    DELETE FROM vote_ledger WHERE election_id = p_election_id;
    DELETE FROM vote_receipts WHERE election_id = p_election_id;
    DELETE FROM elections WHERE id = p_election_id;

    RETURN jsonb_build_object('success', TRUE, 'election_id', p_election_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_election_cascade TO anon, authenticated;

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
    ca.photo_url,
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

UPDATE profiles
SET year = '2nd Year'
WHERE student_id ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$'
   OR student_id ILIKE '%scl%'
   OR email ~* '^[0-9]{2}[A-Za-z]{2,4}l[0-9]+@';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        UPDATE students
        SET year = '2nd Year', admission_type = 'LATERAL'
        WHERE student_id ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$'
           OR student_id ILIKE '%scl%';
    END IF;
END $$;

-- 7. CLEAN UP HALLUCINATED / MOCK AVATARS AND ENSURE TRUE DATABASE DATA
-- Remove any mock unsplash photos
UPDATE candidates SET photo_url = NULL WHERE photo_url LIKE '%unsplash%';
UPDATE candidate_applications SET photo_url = NULL WHERE photo_url LIKE '%unsplash%';

-- Link actual profile avatar from profiles table if available
UPDATE candidates c
SET photo_url = p.avatar_url
FROM profiles p
WHERE (c.student_id = p.student_id OR c.email = p.email)
  AND p.avatar_url IS NOT NULL 
  AND p.avatar_url != ''
  AND p.avatar_url NOT LIKE '%unsplash%';

-- Ensure true eligible electorate data (fix any hardcoded/hallucinated counts like 23)
UPDATE elections
SET eligible_voters_count = GREATEST(votes_count, 1)
WHERE eligible_voters_count = 23;

-- 8. RETROACTIVELY ENROLL ALL EXISTING STUDENTS AS ELIGIBLE VOTERS
INSERT INTO students (
    id,
    student_id,
    full_name,
    email,
    department_name,
    year,
    academic_batch,
    admission_type,
    is_eligible_to_vote
)
SELECT 
    p.id,
    COALESCE(p.student_id, SPLIT_PART(p.email, '@', 1)),
    p.full_name,
    p.email,
    COALESCE(p.department_name, 'Cybersecurity Department'),
    COALESCE(p.year, CASE WHEN p.student_id ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$' THEN '2nd Year' ELSE '1st Year' END),
    COALESCE(p.academic_batch, 'Batch of 2026'),
    CASE WHEN p.student_id ~* '^[0-9]{2}[A-Za-z]{2,4}L[0-9]+$' THEN 'LATERAL' ELSE 'REGULAR' END,
    TRUE
FROM profiles p
WHERE p.role = 'STUDENT'
ON CONFLICT (student_id) DO UPDATE SET
    is_eligible_to_vote = TRUE;

-- Ensure all students are registered in active election eligibility
INSERT INTO election_eligibility (election_id, student_id, is_eligible, has_voted)
SELECT e.id, p.id, TRUE, FALSE
FROM elections e
CROSS JOIN profiles p
WHERE e.status = 'ACTIVE' AND p.role = 'STUDENT'
ON CONFLICT (election_id, student_id) DO UPDATE SET is_eligible = TRUE;




