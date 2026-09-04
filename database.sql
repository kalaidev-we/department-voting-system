-- ====================================================================
-- SECUREVOTE CAMPUS — PRODUCTION MASTER DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ / Supabase
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES / ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'STAFF_ADMIN', 'STUDENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE election_status AS ENUM (
        'DRAFT',
        'SCHEDULED',
        'ACTIVE',
        'CLOSED',
        'RESULTS_VERIFIED',
        'PUBLISHED',
        'ARCHIVED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE election_scope AS ENUM (
        'COLLEGE_WIDE',
        'DEPARTMENT',
        'COURSE',
        'ACADEMIC_BATCH',
        'YEAR',
        'SECTION',
        'CUSTOM_GROUP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE voting_type AS ENUM (
        'SINGLE_CHOICE',
        'MULTIPLE_CHOICE',
        'RANKED_CHOICE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'WITHDRAWN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. INSTITUTIONAL STRUCTURE TABLES

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    degree_type VARCHAR(50) DEFAULT 'B.E.',
    duration_years INT DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'Batch of 2025'
    admission_year INT NOT NULL,
    graduation_year INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(10) NOT NULL, -- e.g. 'A', 'B', 'C'
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, department_id)
);

CREATE TABLE IF NOT EXISTS student_id_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    pattern VARCHAR(255) NOT NULL, -- e.g. '^(\d{2})([A-Z]{2})(L)?(\d{2,4})$'
    admission_year_pos INT DEFAULT 1,
    course_code_pos INT DEFAULT 2,
    lateral_flag_pos INT DEFAULT 3,
    roll_number_pos INT DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_mapping_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_pattern VARCHAR(100) NOT NULL,
    target_batch VARCHAR(100) NOT NULL,
    admission_type VARCHAR(50) DEFAULT 'REGULAR', -- 'REGULAR' or 'LATERAL'
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. IDENTITY & USER PROFILES

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id TEXT UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'STUDENT',
    is_active BOOLEAN DEFAULT TRUE,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;


CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. '26SCL03'
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    course_code VARCHAR(10),
    academic_batch VARCHAR(100),
    year VARCHAR(50) DEFAULT '1st Year',
    section VARCHAR(10) DEFAULT 'A',
    admission_type VARCHAR(50) DEFAULT 'REGULAR',
    phone VARCHAR(20),
    is_eligible_to_vote BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation VARCHAR(150) DEFAULT 'Assistant Professor',
    permissions JSONB DEFAULT '["create_election", "manage_candidates", "view_reports"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ELECTIONS & CANDIDATE NOMINATIONS

CREATE TABLE IF NOT EXISTS elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    election_type VARCHAR(100) DEFAULT 'Department Election',
    scope election_scope DEFAULT 'DEPARTMENT',
    target_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    target_batch VARCHAR(100),
    target_year VARCHAR(50),
    target_section VARCHAR(10),
    status election_status DEFAULT 'DRAFT',
    voting_type voting_type DEFAULT 'SINGLE_CHOICE',
    nomination_start_at TIMESTAMPTZ,
    nomination_end_at TIMESTAMPTZ,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    eligible_voters_count INT DEFAULT 0,
    votes_count INT DEFAULT 0,
    rules TEXT,
    max_candidates INT DEFAULT 10,
    is_results_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_election_dates CHECK (end_at > start_at)
);

CREATE TABLE IF NOT EXISTS election_staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff_profiles(id) ON DELETE CASCADE,
    assigned_role VARCHAR(100) DEFAULT 'ELECTION_OFFICER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, staff_id)
);

CREATE TABLE IF NOT EXISTS candidate_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    slogan VARCHAR(255),
    manifesto TEXT NOT NULL,
    bio TEXT,
    campaign_statement TEXT,
    photo_url TEXT,
    symbol VARCHAR(100) DEFAULT '🛡️ Shield',
    status application_status DEFAULT 'SUBMITTED',
    review_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, student_id)
);

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    application_id UUID REFERENCES candidate_applications(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slogan VARCHAR(255),
    manifesto TEXT,
    photo_url TEXT,
    symbol VARCHAR(100) DEFAULT '🛡️ Shield',
    ballot_order INT DEFAULT 0,
    votes_count INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ANONYMOUS VOTING ARCHITECTURE (STRICT DECOUPLING)

-- Part A: Voter Participation Record (Tracks who has voted WITHOUT linking to ballot choice)
-- Points to profiles(id) so BOTH students and staff can cast ballots in elections!
CREATE TABLE IF NOT EXISTS election_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_eligible BOOLEAN DEFAULT TRUE,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, student_id)
);

-- Part B: Anonymous Ballots (Contains candidate selection WITHOUT voter identity)
CREATE TABLE IF NOT EXISTS anonymous_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    ballot_uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    cast_at TIMESTAMPTZ DEFAULT NOW(),
    integrity_hash TEXT NOT NULL
);

-- Part C: Tamper-Evident Cryptographic Ledger (Block hash chain)
CREATE TABLE IF NOT EXISTS vote_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    sequence_number BIGINT NOT NULL,
    ballot_hash TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    block_hash TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, sequence_number)
);

-- Part D: Voter Receipt (Proves participation with verification hash without candidate selection)
CREATE TABLE IF NOT EXISTS vote_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_hash VARCHAR(128) UNIQUE NOT NULL,
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    verification_code VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, student_id)
);

-- Upgrade existing installations: Ensure foreign keys point to profiles (allowing both staff & students)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'election_eligibility' 
          AND ccu.table_name = 'students'
    ) THEN
        ALTER TABLE election_eligibility DROP CONSTRAINT IF EXISTS election_eligibility_student_id_fkey;
        ALTER TABLE election_eligibility ADD CONSTRAINT election_eligibility_student_id_fkey 
            FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'vote_receipts' 
          AND ccu.table_name = 'students'
    ) THEN
        ALTER TABLE vote_receipts DROP CONSTRAINT IF EXISTS vote_receipts_student_id_fkey;
        ALTER TABLE vote_receipts ADD CONSTRAINT vote_receipts_student_id_fkey 
            FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;


-- 7. ELECTION RESULTS & VERIFICATION

CREATE TABLE IF NOT EXISTS election_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    total_votes INT DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0.00,
    rank INT DEFAULT 1,
    is_winner BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, candidate_id)
);

-- 8. AUDIT LOGS, SECURITY EVENTS & NOTIFICATIONS

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    ip_address VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INDEXES FOR PERFORMANCE

CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_elections_dept ON elections(target_department_id);
CREATE INDEX IF NOT EXISTS idx_elections_dates ON elections(start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_student ON election_eligibility(student_id, election_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_voted ON election_eligibility(election_id, has_voted);
CREATE INDEX IF NOT EXISTS idx_anonymous_votes_election ON anonymous_votes(election_id);
CREATE INDEX IF NOT EXISTS idx_vote_ledger_seq ON vote_ledger(election_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id, action);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);

-- 10. ATOMIC TRANSACTIONAL PROCEDURES & SECURITY FUNCTIONS

-- Function A: Submit Vote with Atomic Decoupled Storage
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
DECLARE
    v_election RECORD;
    v_candidate RECORD;
    v_eligibility RECORD;
    v_last_ledger RECORD;
    v_seq_num BIGINT;
    v_prev_hash TEXT;
    v_ballot_hash TEXT;
    v_block_hash TEXT;
    v_receipt_hash VARCHAR(128);
    v_verify_code VARCHAR(32);
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- 1. Validate Election Status & Window
    SELECT * INTO v_election FROM elections WHERE id = p_election_id FOR SHARE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Election not found';
    END IF;

    IF v_election.status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'Election is not actively accepting votes';
    END IF;

    IF v_now < v_election.start_at OR v_now > v_election.end_at THEN
        RAISE EXCEPTION 'Voting window is closed';
    END IF;

    -- 2. Validate Candidate belongs to Election
    SELECT * INTO v_candidate FROM candidates
    WHERE id = p_candidate_id AND election_id = p_election_id FOR SHARE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid candidate for this election';
    END IF;

    -- 3. Validate and Lock Voter Eligibility (Pessimistic Row Lock against concurrent double voting)
    SELECT * INTO v_eligibility FROM election_eligibility
    WHERE election_id = p_election_id AND student_id = p_student_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voter is not registered as eligible for this election';
    END IF;

    IF NOT v_eligibility.is_eligible THEN
        RAISE EXCEPTION 'Voter eligibility has been revoked';
    END IF;

    IF v_eligibility.has_voted THEN
        RAISE EXCEPTION 'Vote already cast. One person, one vote strictly enforced.';
    END IF;

    -- 4. Mark Voter Participation (Decoupled from candidate choice)
    UPDATE election_eligibility
    SET has_voted = TRUE, voted_at = v_now
    WHERE election_id = p_election_id AND student_id = p_student_id;

    -- 5. Prepare Cryptographic Ledger Hashes
    SELECT * INTO v_last_ledger FROM vote_ledger
    WHERE election_id = p_election_id
    ORDER BY sequence_number DESC LIMIT 1;

    IF FOUND THEN
        v_seq_num := v_last_ledger.sequence_number + 1;
        v_prev_hash := v_last_ledger.block_hash;
    ELSE
        v_seq_num := 1;
        v_prev_hash := encode(digest(p_election_id::text, 'sha256'), 'hex');
    END IF;

    v_ballot_hash := encode(digest(gen_random_uuid()::text || p_candidate_id::text || v_now::text, 'sha256'), 'hex');
    v_block_hash := encode(digest(v_prev_hash || v_ballot_hash || v_seq_num::text, 'sha256'), 'hex');

    -- 6. Insert Anonymous Ballot (Contains NO student_id!)
    INSERT INTO anonymous_votes (election_id, candidate_id, integrity_hash, cast_at)
    VALUES (p_election_id, p_candidate_id, v_ballot_hash, v_now);

    -- 7. Append to Tamper-Evident Ledger
    INSERT INTO vote_ledger (election_id, sequence_number, ballot_hash, previous_hash, block_hash, timestamp)
    VALUES (p_election_id, v_seq_num, v_ballot_hash, v_prev_hash, v_block_hash, v_now);

    -- 8. Generate Voter Receipt (Proves vote without exposing choice)
    v_verify_code := upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
    v_receipt_hash := encode(digest(p_election_id::text || p_student_id::text || v_verify_code || v_now::text, 'sha256'), 'hex');

    INSERT INTO vote_receipts (receipt_hash, election_id, student_id, verification_code, created_at)
    VALUES (v_receipt_hash, p_election_id, p_student_id, v_verify_code, v_now);

    -- 9. Increment Candidate & Election Aggregate Counters
    UPDATE candidates SET votes_count = votes_count + 1 WHERE id = p_candidate_id;
    UPDATE elections SET votes_count = votes_count + 1 WHERE id = p_election_id;

    -- Return safe receipt payload
    RETURN jsonb_build_object(
        'success', TRUE,
        'receipt_id', v_receipt_hash,
        'verification_code', v_verify_code,
        'timestamp', v_now,
        'sequence_number', v_seq_num
    );
END;
$$;

-- Function B: Calculate Certified Election Results
CREATE OR REPLACE FUNCTION calculate_election_results(p_election_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_votes INT;
    v_rec RECORD;
    v_rank INT := 1;
    v_prev_votes INT := -1;
BEGIN
    SELECT COUNT(*) INTO v_total_votes FROM anonymous_votes WHERE election_id = p_election_id;

    DELETE FROM election_results WHERE election_id = p_election_id;

    FOR v_rec IN
        SELECT candidate_id, COUNT(*) AS votes
        FROM anonymous_votes
        WHERE election_id = p_election_id
        GROUP BY candidate_id
        ORDER BY votes DESC
    LOOP
        INSERT INTO election_results (
            election_id,
            candidate_id,
            total_votes,
            percentage,
            rank,
            is_winner,
            is_published,
            updated_at
        ) VALUES (
            p_election_id,
            v_rec.candidate_id,
            v_rec.votes,
            CASE WHEN v_total_votes > 0 THEN ROUND((v_rec.votes::numeric / v_total_votes::numeric) * 100, 2) ELSE 0 END,
            v_rank,
            (v_rank = 1),
            FALSE,
            NOW()
        );
        v_rank := v_rank + 1;
    END LOOP;
END;
$$;

-- 11. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read basic, users can update own profile
DROP POLICY IF EXISTS "Public profiles can be read by authenticated users" ON profiles;
CREATE POLICY "Public profiles can be read by authenticated users"
ON profiles FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated USING (auth.uid()::text = auth_user_id OR auth.uid() = id);

-- Departments & Courses: Readable by all authenticated users
DROP POLICY IF EXISTS "Departments read access" ON departments;
CREATE POLICY "Departments read access" ON departments FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Courses read access" ON course_codes;
CREATE POLICY "Courses read access" ON course_codes FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Batches read access" ON academic_batches;
CREATE POLICY "Batches read access" ON academic_batches FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Sections read access" ON sections;
CREATE POLICY "Sections read access" ON sections FOR SELECT TO authenticated USING (TRUE);

-- Elections: Readable by all authenticated users
DROP POLICY IF EXISTS "Elections read access" ON elections;
CREATE POLICY "Elections read access" ON elections FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage elections" ON elections;
CREATE POLICY "Staff can manage elections" ON elections FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Candidates: All authenticated users can view candidates; staff can add/edit candidates
DROP POLICY IF EXISTS "Candidates visible to authenticated" ON candidates;
CREATE POLICY "Candidates visible to authenticated" ON candidates FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage candidates" ON candidates;
CREATE POLICY "Staff can manage candidates" ON candidates FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Staff Management: Master Admin can manage staff profiles
DROP POLICY IF EXISTS "Master admin can manage staff" ON staff_profiles;
CREATE POLICY "Master admin can manage staff" ON staff_profiles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

-- Candidate Applications: Students can see their own; staff can see and review all
DROP POLICY IF EXISTS "Students see own applications" ON candidate_applications;
CREATE POLICY "Students see own applications" ON candidate_applications FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Students can create applications" ON candidate_applications;
CREATE POLICY "Students can create applications" ON candidate_applications FOR INSERT TO authenticated WITH CHECK (
    student_id = auth.uid()
);

-- Eligibility: Voters (students and staff) see own eligibility; staff/admin see all
DROP POLICY IF EXISTS "Voters see own eligibility" ON election_eligibility;
CREATE POLICY "Voters see own eligibility" ON election_eligibility FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Anonymous Votes: NO DIRECT SELECT FOR ORDINARY CLIENTS (Calculated via RPC only)
DROP POLICY IF EXISTS "Staff can view anonymous votes aggregate" ON anonymous_votes;
CREATE POLICY "Staff can view anonymous votes aggregate" ON anonymous_votes FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Vote Receipts: Voters read their own receipt; Super Admin can audit
DROP POLICY IF EXISTS "Voter reads own receipt" ON vote_receipts;
CREATE POLICY "Voter reads own receipt" ON vote_receipts FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

-- Election Results & Analytics: Staff and admins can view full result analytics
DROP POLICY IF EXISTS "Staff can view full results" ON election_results;
CREATE POLICY "Staff can view full results" ON election_results FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Notifications: Users read their own notifications
DROP POLICY IF EXISTS "User reads own notifications" ON notifications;
CREATE POLICY "User reads own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "User updates own notifications" ON notifications;
CREATE POLICY "User updates own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 12. MASTER ADMIN SEED (ONLY SEED DATA PERMITTED)
-- Credentials:
-- Email:    skalaiarasu3@gmail.com
-- Password: Kalai@125

DO $$
DECLARE
    v_user_id UUID := 'a0000000-0000-0000-0000-000000000001';
    v_has_provider_id BOOLEAN := FALSE;
    v_id_type TEXT;
BEGIN
    -- 12.1 Ensure user in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'skalaiarasu3@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            recovery_token,
            email_change,
            email_change_token_new,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            'skalaiarasu3@gmail.com',
            crypt('Kalai@125', gen_salt('bf')),
            NOW(),
            '',
            '',
            '',
            '',
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Master Admin","first_name":"Kalai","last_name":"Arasu"}'::jsonb,
            FALSE,
            NOW(),
            NOW()
        );
    ELSE
        SELECT id INTO v_user_id FROM auth.users WHERE email = 'skalaiarasu3@gmail.com';
        UPDATE auth.users
        SET encrypted_password = crypt('Kalai@125', gen_salt('bf')),
            email_confirmed_at = NOW(),
            confirmation_token = COALESCE(confirmation_token, ''),
            recovery_token = COALESCE(recovery_token, ''),
            email_change = COALESCE(email_change, ''),
            email_change_token_new = COALESCE(email_change_token_new, ''),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- Ensure token columns have empty strings rather than NULL for GoTrue schema scanning
    BEGIN
        UPDATE auth.users
        SET confirmation_token = '',
            recovery_token = '',
            email_change = '',
            email_change_token_new = ''
        WHERE email = 'skalaiarasu3@gmail.com'
          AND (confirmation_token IS NULL OR recovery_token IS NULL OR email_change IS NULL OR email_change_token_new IS NULL);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;


    -- 12.2 Ensure corresponding identity record with dynamic column & type detection
    IF NOT EXISTS (
        SELECT 1 FROM auth.identities 
        WHERE user_id = v_user_id 
           OR (identity_data->>'email') = 'skalaiarasu3@gmail.com'
    ) THEN
        -- Check if provider_id column exists
        SELECT EXISTS (
            SELECT 1 FROM pg_attribute
            WHERE attrelid = 'auth.identities'::regclass
              AND attname = 'provider_id'
              AND NOT attisdropped
        ) INTO v_has_provider_id;

        -- Check whether id column type is text or uuid using pg_attribute + pg_type
        SELECT t.typname INTO v_id_type
        FROM pg_attribute a
        JOIN pg_type t ON a.atttypid = t.oid
        WHERE a.attrelid = 'auth.identities'::regclass
          AND a.attname = 'id'
          AND NOT a.attisdropped;

        IF v_has_provider_id THEN
            IF v_id_type IN ('text', 'varchar') THEN
                EXECUTE 
                    'INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) ' ||
                    'VALUES ($1::text, $2, $3, $4, $5, NOW(), NOW(), NOW())'
                USING v_user_id::text, v_user_id, format('{"sub":"%s","email":"skalaiarasu3@gmail.com"}', v_user_id)::jsonb, 'email', v_user_id::text;
            ELSE
                -- Modern Supabase: id is UUID DEFAULT gen_random_uuid(), provider_id is TEXT
                EXECUTE 
                    'INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) ' ||
                    'VALUES ($1::uuid, $2, $3, $4, $5, NOW(), NOW(), NOW())'
                USING gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"skalaiarasu3@gmail.com"}', v_user_id)::jsonb, 'email', v_user_id::text;
            END IF;
        ELSE
            IF v_id_type IN ('text', 'varchar') THEN
                EXECUTE 
                    'INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) ' ||
                    'VALUES ($1::text, $2, $3, $4, NOW(), NOW(), NOW())'
                USING v_user_id::text, v_user_id, format('{"sub":"%s","email":"skalaiarasu3@gmail.com"}', v_user_id)::jsonb, 'email';
            ELSE
                -- UUID
                EXECUTE 
                    'INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) ' ||
                    'VALUES ($1::uuid, $2, $3, $4, NOW(), NOW(), NOW())'
                USING gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"skalaiarasu3@gmail.com"}', v_user_id)::jsonb, 'email';
            END IF;
        END IF;
    END IF;

    -- 12.3 Ensure user profile in public.profiles with SUPER_ADMIN role
    INSERT INTO public.profiles (
        id,
        auth_user_id,
        full_name,
        first_name,
        last_name,
        email,
        role,
        is_active,
        is_profile_complete,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_user_id::text,
        'Master Admin',
        'Kalai',
        'Arasu',
        'skalaiarasu3@gmail.com',
        'SUPER_ADMIN',
        TRUE,
        TRUE,
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        role = 'SUPER_ADMIN',
        is_active = TRUE,
        is_profile_complete = TRUE,
        updated_at = NOW();
END $$;

-- 12.3 System Settings
INSERT INTO system_settings (key, value, description) VALUES
('allowed_college_domain', '@kpriet.ac.in', 'Only Google accounts ending in this domain can authenticate'),
('master_admin_email', 'skalaiarasu3@gmail.com', 'Super administrator master account')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ====================================================================
-- END OF DATABASE.SQL
-- ====================================================================
