export type UserRole = 'SUPER_ADMIN' | 'STAFF_ADMIN' | 'STUDENT';

export type ElectionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'CLOSED'
  | 'RESULTS_VERIFIED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  department_id?: string;
  department_name?: string;
  student_id?: string;
  course_code?: string;
  academic_batch?: string;
  year?: string;
  section?: string;
  phone?: string;
  is_active: boolean;
  is_profile_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffProfile {
  id: string;
  profile_id: string;
  department_id?: string;
  department_name?: string;
  designation: string;
  permissions?: string[];
  employee_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Election {
  id: string;
  title: string;
  description?: string;
  election_type: string;
  status: ElectionStatus;
  eligible_voters_count: number;
  votes_count: number;
  start_at: string;
  end_at: string;
  department_id?: string;
  department_name?: string;
  academic_year?: string;
  rules?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Candidate {
  id: string;
  name: string;
  election_id: string;
  slogan?: string;
  manifesto?: string;
  photo_url?: string;
  department?: string;
  symbol?: string;
  votes_count: number;
  student_id?: string;
  key_promises?: string[];
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VoteReceipt {
  receipt_id: string;
  verification_code: string;
  election_id: string;
  election_title: string;
  candidate_name?: string; // Optional for confirmation display before sealing
  timestamp: string;
  sequence_number: number;
  ledger_hash: string;
}

export interface CandidateApplication {
  id: string;
  election_id: string;
  election_title: string;
  student_id: string;
  full_name: string;
  email: string;
  department: string;
  year: string;
  cgpa: number;
  slogan: string;
  manifesto: string;
  key_promises: string[];
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  review_notes?: string;
  reviewed_by?: string;
  submitted_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_email: string;
  actor_role: string;
  details: string;
  ip_address: string;
  created_at: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface SecurityEvent {
  id: string;
  event_type: 'DOMAIN_REJECTION' | 'UNAUTHORIZED_ACCESS' | 'TAMPER_DETECTED' | 'RATE_LIMIT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  source_email?: string;
  ip_address: string;
  created_at: string;
}

export interface StudentRosterItem {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  department: string;
  course_code: string;
  academic_batch: string;
  year: string;
  section: string;
  admission_type: 'REGULAR' | 'LATERAL';
  is_eligible_to_vote: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  designation: string;
  permissions: string[];
  can_vote: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CandidateResultStat {
  id: string;
  name: string;
  photo_url?: string;
  slogan?: string;
  department?: string;
  votes: number;
  percentage: number;
  is_winner: boolean;
}

export interface ElectionResultAnalytics {
  election_id: string;
  election_title: string;
  status: ElectionStatus;
  eligible_voters: number;
  total_votes_cast: number;
  turnout_percentage: number;
  candidates: CandidateResultStat[];
  turnout_by_year: Record<string, number>;
  hourly_velocity: Array<{ hour: string; votes: number }>;
  ledger_root_hash: string;
  is_certified: boolean;
}

export interface DashboardSummaryStats {
  eligibleVoters: number;
  votesCast: number;
  participationRate: number;
}

