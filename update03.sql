-- ============================================================================
-- SECUREVOTE CAMPUS: MIGRATION UPDATE 03
-- Student Roster CSV Ingestion Pipeline & Admin DB Management Policies
-- ============================================================================

-- 1. EXTENSIONS & COMPATIBILITY
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. SCHEMA ENHANCEMENTS FOR STUDENTS & STAFF TABLES

-- Ensure students table has standalone columns for full_name, email, and department_name
ALTER TABLE students ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS department_name VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS course_code VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS academic_batch VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS year VARCHAR(50) DEFAULT '1st Year';
ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(10) DEFAULT 'A';
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_type VARCHAR(50) DEFAULT 'REGULAR';
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_eligible_to_vote BOOLEAN DEFAULT TRUE;

-- Ensure staff_profiles table has department_name and permissions columns
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS department_name VARCHAR(255);
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS designation VARCHAR(150) DEFAULT 'Assistant Professor';
ALTER TABLE staff_profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["create_election", "manage_candidates", "view_reports"]'::jsonb;

-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR STUDENTS & PROFILES

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Allow Super Admin and Staff to insert and manage profiles
DROP POLICY IF EXISTS "profiles_admin_insert" ON profiles;
CREATE POLICY "profiles_admin_insert" ON profiles
    FOR INSERT TO authenticated
    WITH CHECK (
        is_admin_or_staff() OR 
        id = auth.uid() OR
        email = 'skalaiarasu3@gmail.com'
    );

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE TO authenticated
    USING (
        is_admin_or_staff() OR 
        id = auth.uid() OR
        email = 'skalaiarasu3@gmail.com'
    );

DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;
CREATE POLICY "profiles_admin_delete" ON profiles
    FOR DELETE TO authenticated
    USING (is_super_admin());

-- Students: Read access for authenticated users, full CRUD for Admin and Staff
DROP POLICY IF EXISTS "students_select_all" ON students;
CREATE POLICY "students_select_all" ON students
    FOR SELECT TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "students_admin_insert" ON students;
CREATE POLICY "students_admin_insert" ON students
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_or_staff());

DROP POLICY IF EXISTS "students_admin_update" ON students;
CREATE POLICY "students_admin_update" ON students
    FOR UPDATE TO authenticated
    USING (is_admin_or_staff());

DROP POLICY IF EXISTS "students_admin_delete" ON students;
CREATE POLICY "students_admin_delete" ON students
    FOR DELETE TO authenticated
    USING (is_admin_or_staff());

-- Staff Profiles: Read access for authenticated users, full CRUD for Super Admin
DROP POLICY IF EXISTS "staff_profiles_select_all" ON staff_profiles;
CREATE POLICY "staff_profiles_select_all" ON staff_profiles
    FOR SELECT TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "staff_profiles_admin_manage" ON staff_profiles;
CREATE POLICY "staff_profiles_admin_manage" ON staff_profiles
    FOR ALL TO authenticated
    USING (is_super_admin() OR is_admin_or_staff())
    WITH CHECK (is_super_admin() OR is_admin_or_staff());

-- 4. ATOMIC STORED PROCEDURE: import_student_roster
-- Bulk imports student records from JSON array, synchronizing profiles and students tables atomically.

CREATE OR REPLACE FUNCTION import_student_roster(p_students JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item JSONB;
    v_student_id TEXT;
    v_full_name TEXT;
    v_email TEXT;
    v_department TEXT;
    v_year TEXT;
    v_section TEXT;
    v_course_code TEXT;
    v_batch TEXT;
    v_admission_type TEXT;
    v_profile_id UUID;
    v_imported_count INT := 0;
    v_updated_count INT := 0;
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_index INT := 0;
BEGIN
    -- Verify input is an array
    IF jsonb_typeof(p_students) != 'array' THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'imported_count', 0,
            'updated_count', 0,
            'errors', ARRAY['Input must be a JSON array of student records.']
        );
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_students)
    LOOP
        v_index := v_index + 1;
        v_student_id := UPPER(TRIM(COALESCE(v_item->>'student_id', '')));
        v_full_name  := TRIM(COALESCE(v_item->>'full_name', ''));
        v_email      := LOWER(TRIM(COALESCE(v_item->>'email', '')));
        v_department := TRIM(COALESCE(v_item->>'department', 'Engineering'));
        v_year       := TRIM(COALESCE(v_item->>'year', '1st Year'));
        v_section    := UPPER(TRIM(COALESCE(v_item->>'section', 'A')));
        v_course_code := TRIM(COALESCE(v_item->>'course_code', ''));
        v_batch      := TRIM(COALESCE(v_item->>'academic_batch', 'Batch of 2026'));
        v_admission_type := UPPER(TRIM(COALESCE(v_item->>'admission_type', 'REGULAR')));

        -- Validation
        IF v_student_id = '' THEN
            v_errors := array_append(v_errors, format('Row %s: Missing student_id.', v_index));
            CONTINUE;
        END IF;

        IF v_email = '' OR NOT (v_email LIKE '%@kpriet.ac.in' OR v_email = 'skalaiarasu3@gmail.com') THEN
            v_errors := array_append(v_errors, format('Row %s (%s): Email must end with @kpriet.ac.in.', v_index, v_full_name));
            CONTINUE;
        END IF;

        IF v_full_name = '' THEN
            v_full_name := v_student_id;
        END IF;

        -- Extract course code if empty
        IF v_course_code = '' THEN
            IF v_student_id ~ '^[0-9]{2}([A-Z]{2})' THEN
                v_course_code := substring(v_student_id from '^[0-9]{2}([A-Z]{2})');
            ELSE
                v_course_code := 'SC';
            END IF;
        END IF;

        -- 1. Check if profile exists by email or student_id
        SELECT id INTO v_profile_id FROM profiles WHERE email = v_email LIMIT 1;

        IF v_profile_id IS NULL THEN
            -- Check if students table has this student_id
            SELECT id INTO v_profile_id FROM students WHERE student_id = v_student_id LIMIT 1;
        END IF;

        IF v_profile_id IS NULL THEN
            -- Insert new profile
            v_profile_id := gen_random_uuid();
            INSERT INTO profiles (
                id,
                full_name,
                email,
                role,
                is_active,
                is_profile_complete,
                created_at,
                updated_at
            ) VALUES (
                v_profile_id,
                v_full_name,
                v_email,
                'STUDENT',
                TRUE,
                TRUE,
                NOW(),
                NOW()
            );
            v_imported_count := v_imported_count + 1;
        ELSE
            -- Update existing profile
            UPDATE profiles SET
                full_name = v_full_name,
                updated_at = NOW()
            WHERE id = v_profile_id;
            v_updated_count := v_updated_count + 1;
        END IF;

        -- 2. Upsert students table
        INSERT INTO students (
            id,
            student_id,
            full_name,
            email,
            department_name,
            course_code,
            academic_batch,
            year,
            section,
            admission_type,
            is_eligible_to_vote,
            created_at,
            updated_at
        ) VALUES (
            v_profile_id,
            v_student_id,
            v_full_name,
            v_email,
            v_department,
            v_course_code,
            v_batch,
            v_year,
            v_section,
            v_admission_type,
            TRUE,
            NOW(),
            NOW()
        )
        ON CONFLICT (student_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            department_name = EXCLUDED.department_name,
            course_code = EXCLUDED.course_code,
            academic_batch = EXCLUDED.academic_batch,
            year = EXCLUDED.year,
            section = EXCLUDED.section,
            admission_type = EXCLUDED.admission_type,
            is_eligible_to_vote = TRUE,
            updated_at = NOW();

    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'imported_count', v_imported_count,
        'updated_count', v_updated_count,
        'total_processed', v_index,
        'errors', v_errors
    );
END;
$$;

-- Grant execution to authenticated and anon users
GRANT EXECUTE ON FUNCTION import_student_roster(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION import_student_roster(JSONB) TO anon;

-- 5. CANDIDATES TABLE ENHANCEMENTS FOR EMAIL & GOOGLE PROFILE LINKING
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS department VARCHAR(255);

DO $$
BEGIN
    ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_student_id_fkey;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE candidates ALTER COLUMN student_id TYPE VARCHAR(255);

-- ============================================================================
-- END OF MIGRATION UPDATE 03
-- ============================================================================

