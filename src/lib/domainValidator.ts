export const DEFAULT_ALLOWED_DOMAIN = '@kpriet.ac.in';

export function getAllowedDomain(): string {
  const envDomain = import.meta.env.VITE_ALLOWED_DOMAIN;
  if (envDomain && envDomain.trim()) {
    const trimmed = envDomain.trim();
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  }
  return DEFAULT_ALLOWED_DOMAIN;
}

export const MASTER_ADMIN_EMAIL = 'skalaiarasu3@gmail.com';
export const ALLOWED_DOMAINS = ['@kpriet.ac.in', '@ariseagency.in', '@vote.ariseagency.in'];

export function validateCollegeEmail(email?: string | null): {
  isValid: boolean;
  email: string;
  domain: string;
  allowedDomain: string;
  isMasterAdmin?: boolean;
} {
  const allowed = getAllowedDomain().toLowerCase();
  if (!email || typeof email !== 'string') {
    return { isValid: false, email: '', domain: '', allowedDomain: allowed };
  }

  const cleanEmail = email.trim().toLowerCase();
  const domainPart = cleanEmail.includes('@') ? `@${cleanEmail.split('@')[1]}` : '';
  const isMasterAdmin = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();
  const isValid =
    cleanEmail.endsWith(allowed) ||
    cleanEmail.endsWith('@ariseagency.in') ||
    cleanEmail.endsWith('@vote.ariseagency.in') ||
    isMasterAdmin;

  return {
    isValid,
    email: cleanEmail,
    domain: domainPart,
    allowedDomain: allowed,
    isMasterAdmin,
  };
}
