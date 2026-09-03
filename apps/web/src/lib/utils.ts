/**
 * Common utility functions
 * @format
 */

/**
 * Get initials from a name string.
 * - Single word name -> first letter only (e.g. "Admin" -> "A")
 * - Multi-word name  -> first letter of first two words (e.g. "John Doe" -> "JD")
 * - Always max 2 characters, always uppercase
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}
