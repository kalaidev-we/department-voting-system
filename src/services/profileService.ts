import { supabase } from '../lib/supabase';
import { UserProfile, StaffProfile, UserRole } from '../lib/types';
import { GoogleAuthIdentity } from './authService';
import { parseStudentId, extractStudentIdFromEmail } from '../lib/studentParser';

export async function syncUserProfile(identity: GoogleAuthIdentity): Promise<UserProfile> {
  const { id: authUserId, email, fullName, avatarUrl, firstName, lastName } = identity;

  // 1. Try to fetch existing profile by id or email
  let existingProfile: any = null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`id.eq.${authUserId},email.eq.${email.toLowerCase()}`)
      .maybeSingle();

    if (!error && data) {
      existingProfile = data;
    }
  } catch (e) {
    console.warn('Profile fetch warning:', e);
  }

  // 2. Check if user is staff in staff_profiles or email indicates staff
  let detectedRole: UserRole = 'STUDENT';
  let staffDetails: any = null;

  if (existingProfile?.role) {
    detectedRole = existingProfile.role;
  } else {
    // Check if master admin or staff
    const lowerEmail = email.toLowerCase();
    if (lowerEmail === 'skalaiarasu3@gmail.com' || lowerEmail.includes('superadmin')) {
      detectedRole = 'SUPER_ADMIN';
    } else {
      const isStaffEmail =
        lowerEmail.includes('staff') ||
        lowerEmail.includes('faculty') ||
        lowerEmail.includes('hod') ||
        lowerEmail.startsWith('dr.') ||
        lowerEmail.startsWith('prof.');

      if (isStaffEmail) {
        detectedRole = 'STAFF_ADMIN';
      }
    }
  }

  // Try to lookup staff record if staff role
  if (detectedRole === 'STAFF_ADMIN' || detectedRole === 'SUPER_ADMIN') {
    try {
      const { data: staffData } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('profile_id', existingProfile?.id || authUserId)
        .maybeSingle();
      if (staffData) staffDetails = staffData;
    } catch (e) {
      // Ignored
    }
  }

  // 3. For student, extract student info
  let studentId = existingProfile?.student_id || extractStudentIdFromEmail(email) || '';
  let departmentName = existingProfile?.department_name || staffDetails?.department || '';
  let year = existingProfile?.year || '';
  let batch = existingProfile?.academic_batch || '';
  let isComplete = true;

  if (detectedRole === 'STUDENT') {
    if (studentId) {
      const parsed = parseStudentId(studentId);
      if (parsed.isValid) {
        if (!departmentName) departmentName = parsed.departmentName;
        // For lateral entry students (e.g. 26SCL03), automatically enforce 2nd Year
        if (!year || (parsed.isLateralEntry && year === '1st Year')) {
          year = parsed.suggestedYear;
        }
        if (!batch || parsed.isLateralEntry) {
          batch = parsed.admissionBatch;
        }
      }
    }
    // If student lacks student ID or department, require completion
    isComplete = Boolean(studentId && departmentName);
  } else if (detectedRole === 'STAFF_ADMIN') {
    if (!departmentName) departmentName = 'Cybersecurity Department';
  }

  const profileObj: UserProfile = {
    id: existingProfile?.id || authUserId,
    auth_user_id: authUserId,
    full_name: fullName || existingProfile?.full_name || 'Campus Voter',
    first_name: firstName,
    last_name: lastName,
    email: email.toLowerCase(),
    avatar_url: avatarUrl || existingProfile?.avatar_url || '',
    role: detectedRole,
    department_id: existingProfile?.department_id,
    department_name: departmentName,
    student_id: studentId,
    academic_batch: batch,
    year: year,
    section: existingProfile?.section || (detectedRole === 'STUDENT' ? 'A' : undefined),
    is_active: existingProfile?.is_active ?? true,
    is_profile_complete: isComplete,
    created_at: existingProfile?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const isValidUuid = (val?: string) =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

  // 4. Upsert/sync profile record to Supabase and automatically register as eligible voter
  try {
    const profilePayload: any = {
      full_name: profileObj.full_name,
      first_name: profileObj.first_name || null,
      last_name: profileObj.last_name || null,
      email: profileObj.email,
      avatar_url: profileObj.avatar_url,
      role: profileObj.role,
      student_id: profileObj.student_id || null,
      department_name: profileObj.department_name || null,
      year: profileObj.year || null,
      academic_batch: profileObj.academic_batch || null,
      section: profileObj.section || 'A',
      is_active: true,
      is_profile_complete: true,
      updated_at: new Date().toISOString(),
    };

    if (existingProfile?.id) {
      profilePayload.id = existingProfile.id;
    } else if (isValidUuid(authUserId)) {
      profilePayload.id = authUserId;
    }

    const { data: savedProfile, error: upsertErr } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (upsertErr) {
      console.warn('Profiles upsert notification:', upsertErr.message);
    }

    const resolvedProfileId =
      savedProfile?.id || existingProfile?.id || (isValidUuid(profileObj.id) ? profileObj.id : null);

    if (resolvedProfileId) {
      profileObj.id = resolvedProfileId;
    }

    // 5. Automatically register student as eligible voter in students & election_eligibility tables
    if (detectedRole === 'STUDENT' && resolvedProfileId) {
      const cleanStudentId = profileObj.student_id || email.split('@')[0].toUpperCase();
      const parsed = parseStudentId(cleanStudentId);
      const assignedYear = parsed.isLateralEntry ? '2nd Year' : (profileObj.year || parsed.suggestedYear || '1st Year');
      const admissionType = parsed.isLateralEntry ? 'LATERAL' : 'REGULAR';

      // Primary Attempt: Use RPC register_student_voter (Security Definer)
      try {
        await supabase.rpc('register_student_voter', {
          p_profile_id: resolvedProfileId,
          p_student_id: cleanStudentId,
          p_full_name: profileObj.full_name,
          p_email: profileObj.email,
          p_department: profileObj.department_name || parsed.departmentName || 'Cybersecurity Department',
          p_year: assignedYear,
          p_batch: profileObj.academic_batch || parsed.admissionBatch || 'Batch of 2026',
          p_admission_type: admissionType,
        });
      } catch {
        // Fallback to direct table inserts
      }

      // Direct Table Fallback: students table
      try {
        await supabase.from('students').upsert({
          id: resolvedProfileId,
          student_id: cleanStudentId,
          full_name: profileObj.full_name,
          email: profileObj.email,
          department_name: profileObj.department_name || parsed.departmentName || 'Cybersecurity Department',
          year: assignedYear,
          academic_batch: profileObj.academic_batch || parsed.admissionBatch || 'Batch of 2026',
          admission_type: admissionType,
          is_eligible_to_vote: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id' });
      } catch {
        // Ignored
      }

      // Automatically enroll in all active elections
      try {
        const { data: activeElections } = await supabase
          .from('elections')
          .select('id')
          .eq('status', 'ACTIVE');

        if (activeElections && activeElections.length > 0) {
          const enrollments = activeElections.map((el: any) => ({
            election_id: el.id,
            student_id: resolvedProfileId,
            is_eligible: true,
            has_voted: false,
          }));

          await supabase
            .from('election_eligibility')
            .upsert(enrollments, { onConflict: 'election_id,student_id' });
        }
      } catch {
        // Ignored
      }
    }
  } catch (err) {
    console.warn('Could not persist profile in database:', err);
  }

  return profileObj;
}

export async function completeStudentProfile(
  profileId: string,
  data: {
    studentId: string;
    department: string;
    academicBatch: string;
    year: string;
    section: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanStudentId = data.studentId.trim().toUpperCase();
    const parsed = parseStudentId(cleanStudentId);
    const assignedYear = parsed.isLateralEntry ? '2nd Year' : (data.year || parsed.suggestedYear || '1st Year');
    const admissionType = parsed.isLateralEntry ? 'LATERAL' : 'REGULAR';

    await Promise.allSettled([
      supabase.from('profiles').update({
        student_id: cleanStudentId,
        department_name: data.department,
        academic_batch: data.academicBatch,
        year: assignedYear,
        section: data.section,
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      }).eq('id', profileId),

      supabase.from('students').upsert({
        id: profileId,
        student_id: cleanStudentId,
        department_name: data.department,
        academic_batch: data.academicBatch,
        year: assignedYear,
        section: data.section,
        admission_type: admissionType,
        is_eligible_to_vote: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'student_id' }),
    ]);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
