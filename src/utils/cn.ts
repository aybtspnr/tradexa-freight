/**
 * Minimal `cn()` helper — merges class names with Tailwind v4.
 * Tailwind v4 handles conflicts natively, so a simple join suffices.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
