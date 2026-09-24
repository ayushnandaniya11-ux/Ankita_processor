// ============================================
// General Helpers
// ============================================

/** Generate a URL-friendly slug from a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truncate text with ellipsis */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

/** Capitalize first letter */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/** Title case */
export function titleCase(text: string): string {
  return text
    .split(/[\s_-]+/)
    .map((word) => capitalize(word))
    .join(' ')
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

/** Get initials from a name (e.g., "Ankita Sharma" → "AS") */
export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, maxChars)
    .join('')
    .toUpperCase()
}

/** Check if value is not null/undefined */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/** Sleep for ms (for mocks/testing) */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Generate a pseudo-random ID (for client-side temp IDs, not for DB) */
export function tempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
