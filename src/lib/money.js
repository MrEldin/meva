/**
 * Format minor units as the shop has always shown them: 1.200 RSD.
 */
export function money(minor) {
  return `${new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 }).format((minor ?? 0) / 100)} RSD`
}
