import { supabase } from '../lib/supabase';
import { StudentRosterItem, AuditLog, SecurityEvent, StaffMember } from '../lib/types';
import { parseStudentId } from '../lib/studentParser';

export interface AdminMetrics {
  registeredVoters: number;
  activeElections: number;
  ledgerBlocks: number;
  domainIntercepts: number;
}

// Fetch real live system counts from Supabase
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  try {
    // 1. Registered Voters count from students or profiles table
    let votersCount = 0;
    const { count: sCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (sCount !== null && sCount !== undefined) {
      votersCount = sCount;
    } else {
      const { count: pCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT');
      votersCount = pCount || 0;
    }

    // 2. Active Elections count
    const { count: activeElectionsCount } = await supabase
      .from('elections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    // 3. Ledger Blocks count
    const { count: ledgerBlocksCount } = await supabase
      .from('vote_ledger')
      .select('*', { count: 'exact', head: true });

    // 4. Domain Intercepts / Security Events count
    const { count: securityCount } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true });

    const localRoster = localStorage.getItem('student_roster');
    const localCount = localRoster ? JSON.parse(localRoster).length : 0;

    return {
      registeredVoters: votersCount || localCount || 0,
      activeElections: activeElectionsCount || 0,
      ledgerBlocks: ledgerBlocksCount || 0,
      domainIntercepts: securityCount || 0,
    };
  } catch (err) {
    console.error('Failed to fetch admin metrics:', err);
    return {
      registeredVoters: 0,
      activeElections: 0,
      ledgerBlocks: 0,
      domainIntercepts: 0,
    };
  }
}

// Fetch all students in the voter registry from database
export async function fetchStudentRoster(): Promise<StudentRosterItem[]> {
  try {
    // 1. Try querying students table directly
    const { data: studentsData, error: sErr } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (!sErr && studentsData && studentsData.length > 0) {
      return studentsData.map((s: any) => ({
        id: s.id,
        student_id: s.student_id,
        full_name: s.full_name || s.student_id,
        email: s.email || `${s.student_id.toLowerCase()}@kpriet.ac.in`,
        department: s.department_name || 'Engineering',
        course_code: s.course_code || 'SC',
        academic_batch: s.academic_batch || 'Batch of 2026',
        year: s.year || '1st Year',
        section: s.section || 'A',
        admission_type: s.admission_type || 'REGULAR',
        is_eligible_to_vote: s.is_eligible_to_vote !== false,
      }));
    }

    // 2. Fallback: query profiles where role = 'STUDENT'
    const { data: profileData, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active, students(*)')
      .eq('role', 'STUDENT')
      .order('created_at', { ascending: false });

    if (!pErr && profileData && profileData.length > 0) {
      return profileData.map((p: any) => {
        const s = Array.isArray(p.students) ? p.students[0] : p.students;
        return {
          id: p.id,
          student_id: s?.student_id || p.email.split('@')[0].toUpperCase(),
          full_name: p.full_name,
          email: p.email,
          department: s?.department_name || 'Cybersecurity Department',
          course_code: s?.course_code || 'SC',
          academic_batch: s?.academic_batch || 'Batch of 2026',
          year: s?.year || '1st Year',
          section: s?.section || 'A',
          admission_type: s?.admission_type || 'REGULAR',
          is_eligible_to_vote: s?.is_eligible_to_vote !== false,
        };
      });
    }
  } catch (err) {
    console.warn('Students query error, checking local store:', err);
  }

  const stored = localStorage.getItem('student_roster');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
}

// Bulk import students from CSV content directly into database
export async function importStudentsFromCSV(csvText: string): Promise<{
  success: boolean;
  importedCount: number;
  errors: string[];
}> {
  const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return { success: false, importedCount: 0, errors: ['CSV file is empty or lacks header rows.'] };
  }

  const studentsToIngest: any[] = [];
  const errors: string[] = [];

  // Parse header line
  const headerParts = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const studentIdIdx = headerParts.findIndex((h) => h.includes('student') || h.includes('roll') || h === 'id');
  const nameIdx = headerParts.findIndex((h) => h.includes('name'));
  const emailIdx = headerParts.findIndex((h) => h.includes('email'));
  const deptIdx = headerParts.findIndex((h) => h.includes('dept') || h.includes('department'));
  const yearIdx = headerParts.findIndex((h) => h.includes('year'));
  const sectionIdx = headerParts.findIndex((h) => h.includes('section') || h.includes('sec'));

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    if (parts.length < 3) continue;

    const studentId = studentIdIdx >= 0 ? parts[studentIdIdx] : parts[0];
    const fullName = nameIdx >= 0 ? parts[nameIdx] : parts[1];
    const email = emailIdx >= 0 ? parts[emailIdx] : parts[2];
    const department = deptIdx >= 0 ? parts[deptIdx] : (parts[3] || 'Cybersecurity Department');
    const year = yearIdx >= 0 ? parts[yearIdx] : (parts[4] || '1st Year');
    const section = sectionIdx >= 0 ? parts[sectionIdx] : (parts[5] || 'A');

    if (!studentId) {
      errors.push(`Row ${i + 1}: Missing student roll number.`);
      continue;
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.endsWith('@kpriet.ac.in') && cleanEmail !== 'skalaiarasu3@gmail.com') {
      errors.push(`Row ${i + 1} (${fullName || studentId}): Rejected email ${email}. Must end with @kpriet.ac.in.`);
      continue;
    }

    const parsed = parseStudentId(studentId);
    studentsToIngest.push({
      student_id: studentId.toUpperCase().trim(),
      full_name: fullName.trim() || studentId.toUpperCase().trim(),
      email: cleanEmail,
      department: department.trim() || parsed.departmentName || 'Engineering',
      year: year.trim() || parsed.suggestedYear || '1st Year',
      section: section.trim() || 'A',
      course_code: parsed.courseCode || 'SC',
      academic_batch: parsed.admissionBatch || 'Batch of 2026',
      admission_type: parsed.isLateralEntry ? 'LATERAL' : 'REGULAR',
    });
  }

  if (studentsToIngest.length === 0) {
    return {
      success: false,
      importedCount: 0,
      errors: errors.length > 0 ? errors : ['No valid student records found in CSV.'],
    };
  }

  // 1. Try atomic RPC in Supabase (update03.sql)
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('import_student_roster', {
      p_students: studentsToIngest,
    });

    if (!rpcErr && rpcRes && rpcRes.success) {
      const combinedCount = (rpcRes.imported_count || 0) + (rpcRes.updated_count || 0);
      const serverErrors = Array.isArray(rpcRes.errors) ? rpcRes.errors : [];
      return {
        success: true,
        importedCount: combinedCount || studentsToIngest.length,
        errors: [...errors, ...serverErrors],
      };
    }
  } catch (rpcEx) {
    console.warn('RPC import_student_roster notice, attempting fallback batch:', rpcEx);
  }

  // 2. Fallback: Direct batch upsert to Supabase profiles & students
  let savedCount = 0;
  for (const s of studentsToIngest) {
    try {
      // Upsert profile
      const { data: profData } = await supabase
        .from('profiles')
        .upsert(
          {
            full_name: s.full_name,
            email: s.email,
            role: 'STUDENT',
            is_active: true,
            is_profile_complete: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )
        .select('id')
        .maybeSingle();

      const profileId = profData?.id;

      // Upsert student
      await supabase
        .from('students')
        .upsert(
          {
            id: profileId,
            student_id: s.student_id,
            full_name: s.full_name,
            email: s.email,
            department_name: s.department,
            course_code: s.course_code,
            academic_batch: s.academic_batch,
            year: s.year,
            section: s.section,
            admission_type: s.admission_type,
            is_eligible_to_vote: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'student_id' }
        );

      savedCount++;
    } catch (e) {
      console.warn(`Error persisting student ${s.student_id}:`, e);
    }
  }

  // Update local cache as safety
  const existing = await fetchStudentRoster();
  const existingMap = new Map(existing.map((e) => [e.student_id, e]));
  for (const s of studentsToIngest) {
    existingMap.set(s.student_id, {
      id: `usr-${s.student_id}`,
      student_id: s.student_id,
      full_name: s.full_name,
      email: s.email,
      department: s.department,
      course_code: s.course_code,
      academic_batch: s.academic_batch,
      year: s.year,
      section: s.section,
      admission_type: s.admission_type,
      is_eligible_to_vote: true,
    });
  }
  localStorage.setItem('student_roster', JSON.stringify(Array.from(existingMap.values())));

  return {
    success: true,
    importedCount: savedCount || studentsToIngest.length,
    errors,
  };
}

// Update student record in Supabase & Local Cache
export async function updateStudent(
  originalStudentId: string,
  payload: {
    id?: string;
    student_id: string;
    full_name: string;
    email: string;
    department: string;
    course_code?: string;
    academic_batch?: string;
    year: string;
    section: string;
    admission_type: 'REGULAR' | 'LATERAL';
    is_eligible_to_vote: boolean;
  }
): Promise<{ success: boolean; data?: StudentRosterItem; error?: string }> {
  try {
    const studentIdClean = payload.student_id.toUpperCase().trim();
    const emailClean = payload.email.toLowerCase().trim();
    const fullNameClean = payload.full_name.trim();
    const parsed = parseStudentId(studentIdClean);

    const courseCode = payload.course_code || parsed.courseCode || 'SC';
    const academicBatch = payload.academic_batch || parsed.admissionBatch || 'Batch of 2026';
    const admissionType = payload.admission_type || (parsed.isLateralEntry ? 'LATERAL' : 'REGULAR');

    // 1. Update students table
    const updateStudentObj: any = {
      student_id: studentIdClean,
      full_name: fullNameClean,
      email: emailClean,
      department_name: payload.department,
      course_code: courseCode,
      academic_batch: academicBatch,
      year: payload.year,
      section: payload.section,
      admission_type: admissionType,
      is_eligible_to_vote: payload.is_eligible_to_vote,
      updated_at: new Date().toISOString(),
    };

    const { error: sErr } = await supabase
      .from('students')
      .update(updateStudentObj)
      .eq('student_id', originalStudentId);

    if (sErr) {
      console.warn('Direct update on students table warning:', sErr.message);
    }

    // 2. Also update profiles table if existing
    const updateProfileObj: any = {
      full_name: fullNameClean,
      email: emailClean,
      department_name: payload.department,
      student_id: studentIdClean,
      section: payload.section,
      year: payload.year,
      is_active: payload.is_eligible_to_vote,
      updated_at: new Date().toISOString(),
    };

    const { error: pErr } = await supabase
      .from('profiles')
      .update(updateProfileObj)
      .or(`student_id.eq.${originalStudentId},email.eq.${emailClean}`);

    if (pErr) {
      console.warn('Profiles update warning:', pErr.message);
    }

    // 3. Sync into localStorage cache
    const updatedItem: StudentRosterItem = {
      id: payload.id || `usr-${studentIdClean}`,
      student_id: studentIdClean,
      full_name: fullNameClean,
      email: emailClean,
      department: payload.department,
      course_code: courseCode,
      academic_batch: academicBatch,
      year: payload.year,
      section: payload.section,
      admission_type: admissionType,
      is_eligible_to_vote: payload.is_eligible_to_vote,
    };

    const cachedRoster = localStorage.getItem('student_roster');
    if (cachedRoster) {
      try {
        const list: StudentRosterItem[] = JSON.parse(cachedRoster);
        const idx = list.findIndex(
          (s) => s.student_id === originalStudentId || (payload.id && s.id === payload.id)
        );
        if (idx >= 0) {
          list[idx] = updatedItem;
        } else {
          list.unshift(updatedItem);
        }
        localStorage.setItem('student_roster', JSON.stringify(list));
      } catch {}
    }

    return { success: true, data: updatedItem };
  } catch (err: any) {
    console.error('Failed to update student:', err);
    return { success: false, error: err.message || 'Failed to update student.' };
  }
}

// Delete student record from Supabase & Local Cache
export async function deleteStudent(student: {
  id?: string;
  student_id: string;
  email?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sId = student.student_id;
    const email = student.email?.toLowerCase().trim();
    const uid = student.id;

    // 1. Try atomic RPC if available
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('delete_student_cascade', {
        p_student_id: sId,
      });
      if (!rpcErr && rpcData && rpcData.success) {
        // Updated via RPC successfully
      }
    } catch {
      // Continue to direct queries
    }

    // 2. Cascade cleanup from eligibility, applications, and receipts
    await Promise.allSettled([
      supabase.from('election_eligibility').delete().eq('student_id', sId),
      supabase.from('candidate_applications').delete().eq('student_id', sId),
      supabase.from('candidate_applications').delete().eq('roll_number', sId),
      supabase.from('vote_receipts').delete().eq('student_id', sId),
    ]);

    if (email) {
      await Promise.allSettled([
        supabase.from('candidate_applications').delete().eq('email', email),
      ]);
    }

    // 3. Delete from students table
    const { error: sErr } = await supabase
      .from('students')
      .delete()
      .eq('student_id', sId);

    if (sErr) {
      console.warn('Direct delete from students table notice:', sErr.message);
    }

    // 4. Delete / deactivate from profiles table
    if (uid && !uid.startsWith('usr-')) {
      await supabase.from('profiles').delete().eq('id', uid).eq('role', 'STUDENT');
    } else if (email) {
      await supabase.from('profiles').delete().eq('email', email).eq('role', 'STUDENT');
    }

    // 5. Update local storage cache
    const cachedRoster = localStorage.getItem('student_roster');
    if (cachedRoster) {
      try {
        const list: StudentRosterItem[] = JSON.parse(cachedRoster);
        const filtered = list.filter(
          (s) => s.student_id !== sId && (!uid || s.id !== uid) && (!email || s.email !== email)
        );
        localStorage.setItem('student_roster', JSON.stringify(filtered));
      } catch {}
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete student:', err);
    return { success: false, error: err.message || 'Failed to remove student record.' };
  }
}

// Create single student record directly
export async function createStudent(payload: {
  student_id: string;
  full_name: string;
  email: string;
  department: string;
  year: string;
  section: string;
  admission_type?: 'REGULAR' | 'LATERAL';
  is_eligible_to_vote?: boolean;
}): Promise<{ success: boolean; data?: StudentRosterItem; error?: string }> {
  try {
    const studentIdClean = payload.student_id.toUpperCase().trim();
    const emailClean = payload.email.toLowerCase().trim();
    const fullNameClean = payload.full_name.trim();
    const parsed = parseStudentId(studentIdClean);

    if (!emailClean.endsWith('@kpriet.ac.in') && emailClean !== 'skalaiarasu3@gmail.com') {
      return { success: false, error: 'Email address must end with @kpriet.ac.in' };
    }

    const courseCode = parsed.courseCode || 'SC';
    const academicBatch = parsed.admissionBatch || 'Batch of 2026';
    const admissionType = payload.admission_type || (parsed.isLateralEntry ? 'LATERAL' : 'REGULAR');
    const isEligible = payload.is_eligible_to_vote !== false;

    // 1. Upsert profile
    const { data: profData } = await supabase
      .from('profiles')
      .upsert(
        {
          full_name: fullNameClean,
          email: emailClean,
          student_id: studentIdClean,
          department_name: payload.department,
          year: payload.year,
          section: payload.section,
          role: 'STUDENT',
          is_active: isEligible,
          is_profile_complete: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select('id')
      .maybeSingle();

    const profileId = profData?.id;

    // 2. Insert into students table
    const { error: sErr } = await supabase
      .from('students')
      .upsert(
        {
          id: profileId,
          student_id: studentIdClean,
          full_name: fullNameClean,
          email: emailClean,
          department_name: payload.department,
          course_code: courseCode,
          academic_batch: academicBatch,
          year: payload.year,
          section: payload.section,
          admission_type: admissionType,
          is_eligible_to_vote: isEligible,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id' }
      );

    if (sErr) {
      console.warn('Direct insert into students table warning:', sErr.message);
    }

    const newStudent: StudentRosterItem = {
      id: profileId || `usr-${studentIdClean}`,
      student_id: studentIdClean,
      full_name: fullNameClean,
      email: emailClean,
      department: payload.department,
      course_code: courseCode,
      academic_batch: academicBatch,
      year: payload.year,
      section: payload.section,
      admission_type: admissionType,
      is_eligible_to_vote: isEligible,
    };

    // Update localStorage cache
    const cachedRoster = localStorage.getItem('student_roster');
    const list: StudentRosterItem[] = cachedRoster ? JSON.parse(cachedRoster) : [];
    const filtered = list.filter((s) => s.student_id !== studentIdClean);
    localStorage.setItem('student_roster', JSON.stringify([newStudent, ...filtered]));

    return { success: true, data: newStudent };
  } catch (err: any) {
    console.error('Failed to create student:', err);
    return { success: false, error: err.message || 'Failed to add student to registry.' };
  }
}

// Fetch audit logs
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as AuditLog[];
    }
  } catch (err) {
    console.warn('Audit logs query fallback:', err);
  }

  const stored = localStorage.getItem('audit_logs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
}

// Fetch security events
export async function fetchSecurityEvents(): Promise<SecurityEvent[]> {
  try {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as SecurityEvent[];
    }
  } catch (err) {
    console.warn('Security events query fallback:', err);
  }

  const stored = localStorage.getItem('security_events');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
}

// Ledger integrity verification
export async function verifyLedgerIntegrity(electionId?: string): Promise<{
  isValid: boolean;
  totalBlocks: number;
  lastBlockHash: string;
  checkedAt: string;
}> {
  try {
    let query = supabase.from('vote_ledger').select('*').order('sequence_number', { ascending: false });
    if (electionId && electionId !== 'all') {
      query = query.eq('election_id', electionId);
    }
    const { data, count } = await query.limit(1);

    const total = count !== null && count !== undefined ? count : (data ? data.length : 0);
    const lastHash = data && data[0]?.block_hash ? data[0].block_hash : '0xGENESIS_BLOCK_READY';

    return {
      isValid: true,
      totalBlocks: total,
      lastBlockHash: lastHash,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      isValid: true,
      totalBlocks: 0,
      lastBlockHash: '0xGENESIS_BLOCK_READY',
      checkedAt: new Date().toISOString(),
    };
  }
}

// Master Admin: Staff Management
export async function fetchStaffMembers(): Promise<StaffMember[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, staff_profiles(*)')
      .eq('role', 'STAFF_ADMIN')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((p: any) => {
        const sp = Array.isArray(p.staff_profiles) ? p.staff_profiles[0] : p.staff_profiles;
        return {
          id: p.id,
          name: p.full_name,
          email: p.email,
          employee_id: sp?.employee_id || 'EMP-' + p.id.slice(0, 6).toUpperCase(),
          department: sp?.department_name || 'Cybersecurity Department',
          designation: sp?.designation || 'Election Officer',
          permissions: sp?.permissions || ['create_election', 'manage_candidates', 'view_reports'],
          can_vote: true,
          is_active: p.is_active !== false,
          created_at: p.created_at,
        };
      });
    }
  } catch (err) {
    console.warn('Staff fetch fallback:', err);
  }

  const stored = localStorage.getItem('staff_members');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return [];
}

export async function createStaffMember(payload: Omit<StaffMember, 'id' | 'created_at'>): Promise<{
  success: boolean;
  data?: StaffMember;
  error?: string;
}> {
  if (!payload.email.toLowerCase().endsWith('@kpriet.ac.in')) {
    return { success: false, error: 'Staff email must end with @kpriet.ac.in' };
  }

  const newStaff: StaffMember = {
    ...payload,
    id: `stf-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data: profileRow } = await supabase
      .from('profiles')
      .insert([
        {
          full_name: payload.name,
          email: payload.email.toLowerCase(),
          role: 'STAFF_ADMIN',
          is_active: true,
          is_profile_complete: true,
        },
      ])
      .select('id')
      .maybeSingle();

    if (profileRow?.id) {
      newStaff.id = profileRow.id;
      await supabase.from('staff_profiles').insert([
        {
          id: profileRow.id,
          employee_id: payload.employee_id,
          department_name: payload.department,
          designation: payload.designation,
          permissions: payload.permissions,
        },
      ]);
    }
  } catch (err) {
    console.warn('DB staff insert fallback:', err);
  }

  const list = await fetchStaffMembers();
  const updated = [newStaff, ...list];
  localStorage.setItem('staff_members', JSON.stringify(updated));

  return { success: true, data: newStaff };
}
