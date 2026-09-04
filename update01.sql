-- ====================================================================
-- SECUREVOTE CAMPUS — UPDATE 01 MIGRATION SCRIPT (update01.sql)
-- Fixes schema permissions, grants, and ensures all tables are accessible
-- ====================================================================

-- 1. GRANT SCHEMA USAGE & TABLE ACCESS TO AUTHENTICATED & ANON ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 2. ENSURE PROFILES HAS IS_PROFILE_COMPLETE COLUMN
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 3. ENSURE FOREIGN KEYS ON ELIGIBILITY AND RECEIPTS POINT TO PROFILES
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

-- 4. ROW LEVEL SECURITY (RLS) POLICIES — READ AND WRITE PERMISSIONS

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles can be read by all" ON profiles;
CREATE POLICY "Public profiles can be read by all" ON profiles FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid()::text = auth_user_id OR auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role = 'SUPER_ADMIN')
);

-- Elections
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Elections read access" ON elections;
CREATE POLICY "Elections read access" ON elections FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage elections" ON elections;
CREATE POLICY "Staff can manage elections" ON elections FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Candidates
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Candidates visible to all" ON candidates;
CREATE POLICY "Candidates visible to all" ON candidates FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage candidates" ON candidates;
CREATE POLICY "Staff can manage candidates" ON candidates FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Candidate Applications
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Applications visible to owner and staff" ON candidate_applications;
CREATE POLICY "Applications visible to owner and staff" ON candidate_applications FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM profiles WHERE id = auth.uid() OR auth_user_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Students can create applications" ON candidate_applications;
CREATE POLICY "Students can create applications" ON candidate_applications FOR INSERT TO authenticated WITH CHECK (
    student_id IN (SELECT id FROM profiles WHERE id = auth.uid() OR auth_user_id = auth.uid()::text)
);

DROP POLICY IF EXISTS "Staff can review applications" ON candidate_applications;
CREATE POLICY "Staff can review applications" ON candidate_applications FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Staff Profiles
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff profiles visible to authenticated" ON staff_profiles;
CREATE POLICY "Staff profiles visible to authenticated" ON staff_profiles FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Master admin can manage staff" ON staff_profiles;
CREATE POLICY "Master admin can manage staff" ON staff_profiles FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role = 'SUPER_ADMIN')
);

-- Students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students visible to authenticated" ON students;
CREATE POLICY "Students visible to authenticated" ON students FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Master admin can manage students" ON students;
CREATE POLICY "Master admin can manage students" ON students FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role = 'SUPER_ADMIN')
);

-- Election Eligibility
ALTER TABLE election_eligibility ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voters see own eligibility" ON election_eligibility;
CREATE POLICY "Voters see own eligibility" ON election_eligibility FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM profiles WHERE id = auth.uid() OR auth_user_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Staff can manage eligibility" ON election_eligibility;
CREATE POLICY "Staff can manage eligibility" ON election_eligibility FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Anonymous Votes (Direct select restricted; aggregates only)
ALTER TABLE anonymous_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view anonymous votes aggregate" ON anonymous_votes;
CREATE POLICY "Staff can view anonymous votes aggregate" ON anonymous_votes FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Allow voting insert" ON anonymous_votes;
CREATE POLICY "Allow voting insert" ON anonymous_votes FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Vote Ledger
ALTER TABLE vote_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vote ledger readable for audit" ON vote_ledger;
CREATE POLICY "Vote ledger readable for audit" ON vote_ledger FOR SELECT TO anon, authenticated USING (TRUE);

-- Vote Receipts
ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Voter reads own receipt" ON vote_receipts;
CREATE POLICY "Voter reads own receipt" ON vote_receipts FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM profiles WHERE id = auth.uid() OR auth_user_id = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role = 'SUPER_ADMIN')
);

DROP POLICY IF EXISTS "Allow receipt creation" ON vote_receipts;
CREATE POLICY "Allow receipt creation" ON vote_receipts FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Election Results
ALTER TABLE election_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Results readable by all" ON election_results;
CREATE POLICY "Results readable by all" ON election_results FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Staff can manage results" ON election_results;
CREATE POLICY "Staff can manage results" ON election_results FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff and admins read audit logs" ON audit_logs;
CREATE POLICY "Staff and admins read audit logs" ON audit_logs FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role IN ('STAFF_ADMIN', 'SUPER_ADMIN'))
);

DROP POLICY IF EXISTS "Allow inserting audit logs" ON audit_logs;
CREATE POLICY "Allow inserting audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Security Events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read security events" ON security_events;
CREATE POLICY "Admins read security events" ON security_events FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE (id = auth.uid() OR auth_user_id = auth.uid()::text) AND role = 'SUPER_ADMIN')
);

DROP POLICY IF EXISTS "Allow logging security events" ON security_events;
CREATE POLICY "Allow logging security events" ON security_events FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

-- Institutional Structures (Departments, Courses, Batches, Sections)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Departments read access" ON departments;
CREATE POLICY "Departments read access" ON departments FOR SELECT TO anon, authenticated USING (TRUE);

ALTER TABLE course_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Courses read access" ON course_codes;
CREATE POLICY "Courses read access" ON course_codes FOR SELECT TO anon, authenticated USING (TRUE);

ALTER TABLE academic_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Batches read access" ON academic_batches;
CREATE POLICY "Batches read access" ON academic_batches FOR SELECT TO anon, authenticated USING (TRUE);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sections read access" ON sections;
CREATE POLICY "Sections read access" ON sections FOR SELECT TO anon, authenticated USING (TRUE);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Settings read access" ON system_settings;
CREATE POLICY "Settings read access" ON system_settings FOR SELECT TO anon, authenticated USING (TRUE);

DO $$
BEGIN
    UPDATE auth.users
    SET confirmation_token = '',
        recovery_token = '',
        email_change = '',
        email_change_token_new = ''
    WHERE email = 'skalaiarasu3@gmail.com'
      AND (confirmation_token IS NULL OR recovery_token IS NULL OR email_change IS NULL OR email_change_token_new IS NULL);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ====================================================================
-- END OF UPDATE01.SQL
-- ====================================================================
