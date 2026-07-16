export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function deriveNameFromEmail(email: string, fallback: string): string {
  const prefix = email.trim().split('@')[0] ?? '';
  const cleaned = prefix.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return fallback;
  return cleaned.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}
