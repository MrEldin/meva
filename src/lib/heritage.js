/**
 * The house was founded in 1982, and the client wants the age said out loud.
 * The figure is counted, not typed, so the page is still right next January.
 */
export const FOUNDED = 1982

export const YEARS = new Date().getFullYear() - FOUNDED

// Serbian counts years three ways: 41 godinu, 44 godine, 45 godina.
export function yearsLabel(n = YEARS) {
  const tens = n % 100
  const ones = n % 10
  if (tens >= 11 && tens <= 14) return `${n} godina`
  if (ones === 1) return `${n} godinu`
  if (ones >= 2 && ones <= 4) return `${n} godine`
  return `${n} godina`
}
