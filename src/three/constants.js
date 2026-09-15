/**
 * The numbers the page needs before the scene exists.
 *
 * Three.js is six hundred kilobytes; on a phone over mobile data it is the
 * difference between a page that appears at once and one that waits. So the
 * stage is imported only after the page has painted, and everything the page
 * has to know up front -- the animatable state and where the label's back
 * panel sits -- lives here, in a file that imports nothing.
 */

/** How far round the label wraps, as a share of the circumference. */
const WRAP = 0.86

/** Where the front and back panels of the label sit in the texture. */
export const FRONT_CENTRE = 0.24
export const BACK_CENTRE = 0.69

/** Turn a bottle by this much to bring the back panel to the camera. */
export const BACK_ROTATION = -(BACK_CENTRE - FRONT_CENTRE) * Math.PI * 2 * WRAP

/**
 * Everything the page animates. GSAP tweens these numbers; the render loop
 * reads them.
 */
export const defaultState = {
  rotation: -0.7, // hero bottle spin, radians
  tilt: 0, // hero bottle lean, radians
  offsetX: 0, // where the hero stands, left/right of centre (desktop only)
  cameraZ: 7.2,
  cameraY: 0.1,
  lookY: 0,
  spread: 0, // 0 = set hidden below the floor, 1 = lined up beside the hero
  lift: 0, // hero rises in from below on load
  glow: 0.6, // rim light strength
  particles: 0, // floating powder, 0..1
  scan: 0, // scan ring position along the bottle, 0 = base, 1 = cap
  scanAlpha: 0, // scan ring visibility
  leaders: 0, // ingredient leader lines visibility
  sweep: 0, // key light slides across the bottle: −1 left … +1 right
  sway: 1, // how much the hero rocks in place
  lookX: 0, // extra look-at offset, in the products' own units
  // The demonstration: a patch of scalp beside the bottle
  skinLift: 0, // patch rises through the floor
  pour: 0, // bottle leans over the patch
  drop: 0, // the drop's fall, mouth → skin
  film: 0, // lotion spreading over the skin
  flakes: 1, // flakes present → gone
  redness: 1, // redness present → calmed
}
