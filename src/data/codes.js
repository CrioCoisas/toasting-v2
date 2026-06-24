// Active MVP access codes (from INFO.md). In production these are generated per member.
export const ACCESS_CODES = {
  AMIGOS2026: { tier: 'Amigos', discount: 10 },
  VIP2026: { tier: 'Amigos', discount: 10 },
  CHEF2026: { tier: 'Amigos', discount: 10 },
}

// Caps the input — no point typing past the longest valid code.
export const MAX_CODE_LENGTH = Math.max(...Object.keys(ACCESS_CODES).map((c) => c.length))

// Keep only A–Z and 0–9, uppercased — matches how codes are formatted.
export function sanitize(value) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, MAX_CODE_LENGTH)
}

export function validateCode(value) {
  return ACCESS_CODES[value.toUpperCase()] ?? null
}
