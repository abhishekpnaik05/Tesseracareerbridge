export function passwordIssue(password: string): string | null {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use letters and at least one number.";
  }
  return null;
}

export function passwordStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: "Enter a password" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ["Too short", "Getting there", "Good", "Strong"];
  return { score, label: labels[score] ?? "Strong" };
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^[0-9+\-\s]{10,16}$/;

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) return email;
  
  const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 4) return phone;
  
  // Show first 2 and last 4 digits, mask the rest
  const visibleStart = digits.slice(0, 2);
  const visibleEnd = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 6);
  
  return `${visibleStart}${masked}${visibleEnd}`;
}
