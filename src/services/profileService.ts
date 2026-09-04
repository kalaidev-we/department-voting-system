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
        if (!year) year = parsed.suggestedYear;
        if (!batch) batch = parsed.admissionBatch;
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

  // 4. Upsert/sync profile record to Supabase if possible (safe from client)
  try {
    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert({
        id: profileObj.id,
        full_name: profileObj.full_name,
        email: profileObj.email,
        avatar_url: profileObj.avatar_url,
        role: profileObj.role,
        is_active: profileObj.is_active,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (upsertErr) {
      console.warn('Profiles upsert notification (RLS protected):', upsertErr.message);
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
    // Attempt update to Supabase
    const { error } = await supabase
      .from('students')
      .upsert({
        id: profileId,
        full_name: data.studentId,
        section: data.section,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Student table update (RLS):', error.message);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
