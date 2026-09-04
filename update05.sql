-- ============================================================================
-- SECUREVOTE CAMPUS: MIGRATION UPDATE 05 (update05.sql)
-- Super Admin Student Registry Management: Edit, Delete & Cascade Purge
-- ============================================================================

-- 1. DELETE POLICIES FOR STUDENTS AND PROFILES
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_delete_all" ON students;
CREATE POLICY "students_delete_all" ON students
    FOR DELETE TO anon, authenticated
    USING (TRUE);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_delete_all" ON profiles;
CREATE POLICY "profiles_delete_all" ON profiles
    FOR DELETE TO anon, authenticated
    USING (TRUE);

ALTER TABLE election_eligibility ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "election_eligibility_delete_all" ON election_eligibility;
CREATE POLICY "election_eligibility_delete_all" ON election_eligibility
    FOR DELETE TO anon, authenticated
    USING (TRUE);

-- 2. ATOMIC STORED PROCEDURE: delete_student_cascade (SECURITY DEFINER)
-- Completely purges a student record, associated applications, and voting eligibility cleanly.
CREATE OR REPLACE FUNCTION delete_student_cascade(p_student_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_id TEXT;
    v_profile_id UUID;
    v_email TEXT;
BEGIN
    v_clean_id := UPPER(TRIM(p_student_id));
    
    -- 1. Find profile ID and email if available
    SELECT id, email INTO v_profile_id, v_email 
    FROM profiles 
    WHERE student_id = v_clean_id OR email ILIKE v_clean_id || '@%'
    LIMIT 1;

    -- 2. Purge dependent records first
    DELETE FROM election_eligibility WHERE student_id = v_clean_id;
    DELETE FROM candidate_applications WHERE student_id = v_clean_id OR roll_number = v_clean_id;
    DELETE FROM vote_receipts WHERE student_id = v_clean_id;

    IF v_email IS NOT NULL THEN
        DELETE FROM candidate_applications WHERE email = v_email;
    END IF;

    -- 3. Delete from students table
    DELETE FROM students WHERE student_id = v_clean_id;

    -- 4. Delete from profiles table if student role
    IF v_profile_id IS NOT NULL THEN
        DELETE FROM profiles WHERE id = v_profile_id AND role = 'STUDENT';
    ELSE
        DELETE FROM profiles WHERE student_id = v_clean_id AND role = 'STUDENT';
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'student_id', v_clean_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'error', SQLERRM
    );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION delete_student_cascade(TEXT) TO anon, authenticated;
