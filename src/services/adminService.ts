import { supabase } from '../lib/supabase';
import { StudentRosterItem, AuditLog, SecurityEvent, StaffMember } from '../lib/types';
import { parseStudentId } from '../lib/studentParser';

export const INITIAL_STUDENT_ROSTER: StudentRosterItem[] = [
  {
    id: 'usr-001',
    student_id: '26SCL03',
    full_name: 'S. K. Alagan',
    email: '26scl03@kpriet.ac.in',
    department: 'Cybersecurity Department',
    course_code: 'SC',
    academic_batch: 'Batch of 2026',
    year: '2nd Year',
    section: 'A',
    admission_type: 'LATERAL',
    is_eligible_to_vote: true,
  },
  {
    id: 'usr-002',
    student_id: '25SC004',
    full_name: 'Arun Kumar',
    email: '25sc004@kpriet.ac.in',
    department: 'Cybersecurity Department',
    course_code: 'SC',
    academic_batch: 'Batch of 2025',
    year: '3rd Year',
    section: 'A',
    admission_type: 'REGULAR',
    is_eligible_to_vote: true,
  },
  {
    id: 'usr-003',
    student_id: '25SC012',
    full_name: 'Priya Nair',
    email: '25sc012@kpriet.ac.in',
    department: 'Cybersecurity Department',
    course_code: 'SC',
    academic_batch: 'Batch of 2025',
    year: '3rd Year',
    section: 'A',
    admission_type: 'REGULAR',
    is_eligible_to_vote: true,
  },
  {
    id: 'usr-004',
    student_id: '25SC028',
    full_name: 'Rahul S',
    email: '25sc028@kpriet.ac.in',
    department: 'Cybersecurity Department',
    course_code: 'SC',
    academic_batch: 'Batch of 2025',
    year: '3rd Year',
    section: 'B',
    admission_type: 'REGULAR',
    is_eligible_to_vote: true,
  },
  {
    id: 'usr-005',
    student_id: '25SC041',
    full_name: 'Sneha Patel',
    email: '25sc041@kpriet.ac.in',
    department: 'Cybersecurity Department',
    course_code: 'SC',
    academic_batch: 'Batch of 2025',
    year: '3rd Year',
    section: 'B',
    admission_type: 'REGULAR',
    is_eligible_to_vote: true,
  },
  {
    id: 'usr-006',
    student_id: '26CS089',
    full_name: 'Kavitha R',
    email: '26cs089@kpriet.ac.in',
    department: 'Computer Science and Engineering',
    course_code: 'CS',
    academic_batch: 'Batch of 2026',
    year: '2nd Year',
    section: 'B',
    admission_type: 'REGULAR',
    is_eligible_to_vote: true,
  },
  {
    id: 'usr-007',
    student_id: '26AD015',
    full_name: 'Harish V',
    email: '26ad015@kpriet.ac.in',
    department: 'Artificial Intelligence & Data Science',
    course_code: 'AD',
    academic_batch: 'Batch of 2026',
    year: '2nd Year',
    section: 'A',
    admission_type: 'REGULAR',
    is_eligible_to_vote: true,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    action: 'ELECTION_STARTED',
    actor_email: 'staff.kumar@kpriet.ac.in',
    actor_role: 'STAFF_ADMIN',
    details: 'Election "Cybersecurity Association President" transitioned from SCHEDULED to ACTIVE status.',
    ip_address: '10.12.4.88 (Campus Network)',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: 'SUCCESS',
  },
  {
    id: 'aud-002',
    action: 'BALLOT_RECORDED_ANONYMOUS',
    actor_email: 'system.cryptoledger@kpriet.ac.in',
    actor_role: 'SYSTEM',
    details: 'Block #932 sealed in vote_ledger. Previous hash verified. Zero voter identity retained.',
    ip_address: '127.0.0.1 (PostgreSQL Secure RPC)',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'SUCCESS',
  },
  {
    id: 'aud-003',
    action: 'CANDIDATE_APPROVED',
    actor_email: 'staff.kumar@kpriet.ac.in',
    actor_role: 'STAFF_ADMIN',
    details: 'Nomination for candidate Arun Kumar approved after verifying CGPA 8.92 and conduct record.',
    ip_address: '10.12.4.88 (Campus Network)',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'SUCCESS',
  },
  {
    id: 'aud-004',
    action: 'VOTER_REGISTRY_CSV_IMPORT',
    actor_email: 'superadmin.election@kpriet.ac.in',
    actor_role: 'SUPER_ADMIN',
    details: 'Imported 1,248 student voter records for Academic Year 2026-27.',
    ip_address: '10.12.0.1 (Admin Gateway)',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: 'SUCCESS',
  },
];

export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'sec-001',
    event_type: 'DOMAIN_REJECTION',
    severity: 'HIGH',
    description: 'Blocked unauthorized Google OAuth authentication attempt from non-college domain: outsider@gmail.com',
    source_email: 'outsider@gmail.com',
    ip_address: '49.37.182.10',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'sec-002',
    event_type: 'UNAUTHORIZED_ACCESS',
    severity: 'MEDIUM',
    description: 'Student role attempted to directly access protected administrative path /staff/elections/create.',
    source_email: '26scl03@kpriet.ac.in',
    ip_address: '10.12.8.14',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'sec-003',
    event_type: 'DOMAIN_REJECTION',
    severity: 'HIGH',
    description: 'Blocked personal Gmail address attempt: student.personal@yahoo.com (Policy requires @kpriet.ac.in).',
    source_email: 'student.personal@yahoo.com',
    ip_address: '103.22.140.5',
    created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
  },
];

// Fetch all students in the voter registry
export async function fetchStudentRoster(): Promise<StudentRosterItem[]> {
  const stored = localStorage.getItem('student_roster');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return INITIAL_STUDENT_ROSTER;
}

// Bulk import students from CSV content
export async function importStudentsFromCSV(csvText: string): Promise<{
  success: boolean;
  importedCount: number;
  errors: string[];
}> {
  const lines = csvText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return { success: false, importedCount: 0, errors: ['CSV file is empty or lacks header rows.'] };
  }

  const existing = await fetchStudentRoster();
  const newItems: StudentRosterItem[] = [];
  const errors: string[] = [];

  // Assume header is line 0: student_id,full_name,email,department
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    if (parts.length < 3) continue;

    const [studentId, fullName, email, department] = parts;

    // Check college email domain
    if (!email.toLowerCase().endsWith('@kpriet.ac.in')) {
      errors.push(`Row ${i + 1} (${fullName}): Rejected domain ${email}. Must end with @kpriet.ac.in.`);
      continue;
    }

    const parsed = parseStudentId(studentId);
    newItems.push({
      id: `usr-csv-${Date.now()}-${i}`,
      student_id: studentId.toUpperCase(),
      full_name: fullName,
      email: email.toLowerCase(),
      department: department || parsed.departmentName || 'Engineering',
      course_code: parsed.courseCode || 'SC',
      academic_batch: parsed.admissionBatch || 'Batch of 2026',
      year: parsed.suggestedYear || '1st Year',
      section: 'A',
      admission_type: parsed.isLateralEntry ? 'LATERAL' : 'REGULAR',
      is_eligible_to_vote: true,
    });
  }

  const combined = [...newItems, ...existing];
  localStorage.setItem('student_roster', JSON.stringify(combined));

  return {
    success: true,
    importedCount: newItems.length,
    errors,
  };
}

// Fetch audit logs
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const stored = localStorage.getItem('audit_logs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return INITIAL_AUDIT_LOGS;
}

// Fetch security events
export async function fetchSecurityEvents(): Promise<SecurityEvent[]> {
  const stored = localStorage.getItem('security_events');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return INITIAL_SECURITY_EVENTS;
}

// Ledger integrity verification
export async function verifyLedgerIntegrity(electionId: string): Promise<{
  isValid: boolean;
  totalBlocks: number;
  lastBlockHash: string;
  checkedAt: string;
}> {
  // Simulate cryptographic verification of blockchain hash linkage
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    isValid: true,
    totalBlocks: 932,
    lastBlockHash: '0x8f3c7e2b1a9904d6e5a4f78310c8b2a31d99e04f6a782b1c4e5f60912a7d8c',
    checkedAt: new Date().toISOString(),
  };
}

// Master Admin: Staff Management
export const INITIAL_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'stf-001',
    name: 'Dr. S. Kumar',
    email: 'staff.kumar@kpriet.ac.in',
    employee_id: 'EMP-SC-012',
    department: 'Cybersecurity Department',
    designation: 'Associate Professor & Chief Election Officer',
    permissions: ['create_election', 'manage_candidates', 'view_reports', 'review_applications'],
    can_vote: true,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'stf-002',
    name: 'Prof. Anitha M',
    email: 'staff.anitha@kpriet.ac.in',
    employee_id: 'EMP-CS-045',
    department: 'Computer Science and Engineering',
    designation: 'Assistant Professor & Election Observer',
    permissions: ['view_reports', 'manage_candidates'],
    can_vote: true,
    is_active: true,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
];

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  const stored = localStorage.getItem('staff_members');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return INITIAL_STAFF_MEMBERS;
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
    await supabase.from('profiles').insert([{
      full_name: payload.name,
      email: payload.email.toLowerCase(),
      role: 'STAFF_ADMIN',
      is_active: true,
      is_profile_complete: true,
    }]);
  } catch (err) {
    console.warn('DB staff insert fallback:', err);
  }

  const list = await fetchStaffMembers();
  const updated = [newStaff, ...list];
  localStorage.setItem('staff_members', JSON.stringify(updated));

  return { success: true, data: newStaff };
}

