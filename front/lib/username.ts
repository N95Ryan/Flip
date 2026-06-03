const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export function validateUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!USERNAME_RE.test(trimmed)) {
    return 'Letters, numbers and _ only (3–30 characters). E.g. Big_Nayru';
  }
  return null;
}

export function normalizeUsernameInput(value: string): string {
  return value.trim().replace(/\s+/g, '_');
}
