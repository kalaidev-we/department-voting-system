import { supabase } from '../lib/supabase';
import { CandidateApplication } from '../lib/types';

export const INITIAL_APPLICATIONS: CandidateApplication[] = [
  {
    id: 'app-001',
    election_id: 'el-001',
    election_title: 'Cybersecurity Association President',
    student_id: '25SC004',
    full_name: 'Arun Kumar',
    email: '25sc004@kpriet.ac.in',
    department: 'Cybersecurity Department',
    year: '3rd Year',
    cgpa: 8.92,
    slogan: 'A Safer, Smarter, Stronger Cyber Community',
    manifesto:
      'My mission is to elevate the Cybersecurity Department to national acclaim through 24/7 red-teaming lab access, high-impact industry bug-bounty workshops, and sponsored student certifications.',
    key_promises: [
      '24/7 High-Performance Student Cyber Defense & Pen-Testing Lab',
      'Guaranteed Monthly Industry Workshops & Bug-Bounty Bootcamps',
      'Department-sponsored certifications (CompTIA Security+, CEH)',
    ],
    status: 'APPROVED',
    review_notes: 'Academic credentials verified (CGPA 8.92, zero disciplinary marks). Approved by Dean.',
    reviewed_by: 'Dr. S. Kumar (Chief Election Officer)',
    submitted_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'app-002',
    election_id: 'el-001',
    election_title: 'Cybersecurity Association President',
    student_id: '25SC012',
    full_name: 'Priya Nair',
    email: '25sc012@kpriet.ac.in',
    department: 'Cybersecurity Department',
    year: '3rd Year',
    cgpa: 9.15,
    slogan: 'Your Ideas. Our Action. For a Better Department.',
    manifesto:
      'Dedicated to student-led transparency, female empowerment in cybersecurity leadership, and guaranteed venture mentoring for collegiate tech startups.',
    key_promises: [
      'Women in Cybersecurity Leadership & Mentorship Fellowship',
      '100% Transparent Student Association Budget & Resource Allocation',
      'Inter-college Hackathons with guaranteed venture funding support',
    ],
    status: 'APPROVED',
    review_notes: 'Eligible and verified. Approved by Department HoD.',
    reviewed_by: 'Dr. S. Kumar (Chief Election Officer)',
    submitted_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'app-003',
    election_id: 'el-002',
    election_title: 'Student Council General Secretary',
    student_id: '26SCL03',
    full_name: 'S. K. Alagan',
    email: '26scl03@kpriet.ac.in',
    department: 'Cybersecurity Department',
    year: '2nd Year (Lateral)',
    cgpa: 8.74,
    slogan: 'Unity Across Batches, Innovation in Every Domain.',
    manifesto:
      'Ensuring seamless integration of lateral entry students, campus-wide WiFi bandwidth upgrades, and automated student grievance redressal within 24 hours.',
    key_promises: [
      'Automated 24/7 Campus Issue Resolution Tracker',
      'Subsidized Hostel & Mess Facilities Advisory Board',
      'Cross-department hackathons and open-innovation incubators',
    ],
    status: 'UNDER_REVIEW',
    submitted_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
];

export async function fetchCandidateApplications(): Promise<CandidateApplication[]> {
  try {
    const { data, error } = await supabase
      .from('candidate_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as any;
    }
  } catch (err) {
    console.warn('Applications table fetch fallback:', err);
  }

  const stored = localStorage.getItem('candidate_applications');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  return INITIAL_APPLICATIONS;
}

export async function submitCandidateApplication(payload: Omit<CandidateApplication, 'id' | 'status' | 'submitted_at'>): Promise<{ success: boolean; data?: CandidateApplication; error?: string }> {
  const newApp: CandidateApplication = {
    ...payload,
    id: `app-${Date.now()}`,
    status: 'SUBMITTED',
    submitted_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('candidate_applications').insert([{
      election_id: newApp.election_id,
      student_id: newApp.student_id,
      slogan: newApp.slogan,
      manifesto: newApp.manifesto,
      status: 'SUBMITTED',
    }]).select().single();

    if (!error && data) {
      // Success from db
    }
  } catch (err) {
    console.warn('Candidate application DB insert fallback:', err);
  }

  // Update local storage cache
  const list = await fetchCandidateApplications();
  const updated = [newApp, ...list];
  localStorage.setItem('candidate_applications', JSON.stringify(updated));

  return { success: true, data: newApp };
}

export async function reviewApplication(
  applicationId: string,
  newStatus: 'APPROVED' | 'REJECTED',
  reviewNotes: string,
  reviewerName: string
): Promise<{ success: boolean }> {
  try {
    await supabase
      .from('candidate_applications')
      .update({
        status: newStatus,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);
  } catch (err) {
    console.warn('DB update application fallback:', err);
  }

  const list = await fetchCandidateApplications();
  const updated = list.map((app) =>
    app.id === applicationId
      ? {
          ...app,
          status: newStatus,
          review_notes: reviewNotes,
          reviewed_by: reviewerName,
        }
      : app
  );
  localStorage.setItem('candidate_applications', JSON.stringify(updated));

  return { success: true };
}
