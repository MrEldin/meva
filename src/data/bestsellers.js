/**
 * The preparations the fifteen-year order history puts at the top, in order.
 *
 * Shared by the front page and the catalogue, so both show the shop the same
 * way round: what people actually buy first, then everything else by name.
 */
export const BESTSELLERS = [
  'sampon-za-kosu-200ml',
  'losion-za-seboreicni-dermatitis',
  'set-za-seboreju-za-kosu-i-lice',
  'set-za-psorijazu-za-kozu-glave-i-tela',
  'keratin-regenerator',
  'krema-protiv-gljivica-dan-50ml',
  'ulje-za-kosu-i-obrve-50ml',
  'mleko-za-telo',
]

/** Where a product sits in that list, or a large number if it is not in it. */
export function rank(product) {
  const at = BESTSELLERS.findIndex((slug) => product.slug?.startsWith(slug))

  return at === -1 ? BESTSELLERS.length : at
}

/** Best sellers first, then the rest alphabetically. */
export function byPopularity(a, b) {
  return rank(a) - rank(b) || a.name.localeCompare(b.name, 'sr')
}
