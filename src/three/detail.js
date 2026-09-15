/**
 * How finely the shapes are built.
 *
 * A bottle is drawn about three hundred pixels tall. Going round it in 128
 * segments puts four vertices on every pixel of its silhouette, and every one
 * of them is paid for again when the shadow is drawn. At a third of that the
 * outline is still smooth and the machine has a third of the work.
 *
 * The modules that build geometry read this, so it has to be set before the
 * stage builds anything.
 */
let factor = 1

export function setDetail(value) {
  factor = Math.max(0.2, Math.min(1, value))
}

export function getDetail() {
  return factor
}

/**
 * Scale a segment count, never below what still reads as a curve.
 *
 * @param  {number} segments  the count at full detail
 * @param  {number} floor     the fewest that still looks round
 */
export function segments(count, floor = 12) {
  return Math.max(floor, Math.round(count * factor))
}
