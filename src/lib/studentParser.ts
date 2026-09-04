export interface ParsedStudentInfo {
  studentId: string;
  admissionBatch: string;
  academicBatchYear: number;
  courseCode: string;
  departmentName: string;
  isLateralEntry: boolean;
  rollNumber: string;
  suggestedYear: string;
  isValid: boolean;
}

export const COURSE_MAPPINGS: Record<string, { name: string; department: string }> = {
  SC: { name: 'Cybersecurity', department: 'Department of Cybersecurity' },
  CS: { name: 'Computer Science & Engineering', department: 'Department of Computer Science' },
  AD: { name: 'Artificial Intelligence & Data Science', department: 'Department of AI & Data Science' },
  IT: { name: 'Information Technology', department: 'Department of Information Technology' },
  EC: { name: 'Electronics & Communication Engineering', department: 'Department of ECE' },
  EE: { name: 'Electrical & Electronics Engineering', department: 'Department of EEE' },
  ME: { name: 'Mechanical Engineering', department: 'Department of Mechanical Engineering' },
  CE: { name: 'Civil Engineering', department: 'Department of Civil Engineering' },
  BM: { name: 'Biomedical Engineering', department: 'Department of Biomedical Engineering' },
};

/**
 * Parses a student roll/register ID according to college formats:
 * Examples:
 *  - 25SC003 -> Batch 2025, Course SC (Cybersecurity), Roll 003
 *  - 26SCL03 -> Batch 2026, Course SC (Cybersecurity), Lateral Entry, Roll 03
 */
export function parseStudentId(rawId?: string | null): ParsedStudentInfo {
  const result: ParsedStudentInfo = {
    studentId: '',
    admissionBatch: '',
    academicBatchYear: 2025,
    courseCode: '',
    departmentName: '',
    isLateralEntry: false,
    rollNumber: '',
    suggestedYear: '1st Year',
    isValid: false,
  };

  if (!rawId || typeof rawId !== 'string') return result;

  const id = rawId.trim().toUpperCase();
  result.studentId = id;

  // Regex matches: 2 digits (batch) + 2 letters (course) + optional 'L' (lateral) + digits (roll)
  const pattern = /^(\d{2})([A-Z]{2})(L)?(\d{2,4})$/;
  const match = id.match(pattern);

  if (match) {
    const [, batchDigits, course, lateralFlag, roll] = match;
    const batchYear = 2000 + parseInt(batchDigits, 10);

    result.admissionBatch = lateralFlag ? `Batch of ${batchYear} (Lateral Entry)` : `Batch of ${batchYear}`;
    result.academicBatchYear = batchYear;
    result.courseCode = course;
    result.isLateralEntry = !!lateralFlag;
    result.rollNumber = roll;

    const courseInfo = COURSE_MAPPINGS[course];
    if (courseInfo) {
      result.departmentName = courseInfo.name;
    } else {
      result.departmentName = `Department of ${course}`;
    }

    // Determine current year of study based on batch
    const currentYear = new Date().getFullYear();
    const yearsDiff = currentYear - batchYear + 1;

    if (yearsDiff <= 1) result.suggestedYear = '1st Year';
    else if (yearsDiff === 2) result.suggestedYear = '2nd Year';
    else if (yearsDiff === 3) result.suggestedYear = '3rd Year';
    else result.suggestedYear = '4th Year';

    result.isValid = true;
  }

  return result;
}

/**
 * Extracts possible student roll ID from college email
 * e.g. "25sc003@kpriet.ac.in" -> "25SC003"
 */
export function extractStudentIdFromEmail(email?: string | null): string | null {
  if (!email) return null;
  const username = email.split('@')[0];
  const cleaned = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const parsed = parseStudentId(cleaned);
  return parsed.isValid ? parsed.studentId : null;
}
