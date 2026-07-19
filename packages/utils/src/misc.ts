/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate a random integer between min (inclusive) and max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a short unique ID (collision-safe for UI purposes).
 */
export function uid(prefix = ''): string {
  const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  return prefix ? `${prefix}_${id}` : id
}
