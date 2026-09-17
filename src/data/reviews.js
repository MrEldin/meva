/**
 * Customer words, verbatim from the previous shop (product reviews and the
 * "O nama" page). Nothing here is invented; add new ones as they come in.
 *
 * `slug` names the product in this catalogue the review was left on, so the
 * front page can show it. It is only filled in where the product name the
 * review carries matches a product exactly -- "Hidratantna krema", "Serum za
 * lice" and "Nega tela" are not names of anything the shop sells, and a
 * review shown against the wrong jar is worse than one shown against none.
 * Those three keep their wording and go without a picture.
 */
export const reviews = [
  {
    name: 'Anastasija',
    product: 'Šampon za kosu',
    slug: 'sampon-za-kosu-200ml',
    rating: 5,
    text: 'U životu nisam koristila bolji šampon za kosu. Sastav mu je odličan. Ne želim nikad više da koristim neki drugi šampon, ovaj je sve što mojoj kosi treba.',
  },
  {
    name: 'Aleksandra',
    product: 'Krema protiv akni',
    slug: 'krema-protiv-akni',
    rating: 5,
    text: 'Predobra krema za bubuljice, dva dana mazanja i nestaju.',
  },
  {
    name: 'Aleksandra',
    product: 'Losion protiv akni',
    slug: 'losion-protiv-akni-dan',
    rating: 5,
    text: 'Zaista predobar losion. Jako mi je drago da neko pravi proizvode koji su mnogo dobri i pristupačnih cena.',
  },
  {
    name: 'Amela Kardović',
    product: 'Hidratantna krema',
    rating: 5,
    text: 'Otkrila sam ovu čudesnu hidratantnu kremu i moram priznati da sam oduševljena! Nakon samo nekoliko dana korišćenja, moja koža je postala mekša i sjajnija.',
  },
  {
    name: 'Lara Kežman',
    product: 'Serum za lice',
    rating: 5,
    text: 'Ovaj organski serum za lice je pravo otkriće! Bogat je antioksidansima i prirodnim uljima koja intenzivno hrane kožu.',
  },
  {
    name: 'Anđela Đokić',
    product: 'Nega tela',
    rating: 5,
    text: 'Miris je osvežavajući i dugotrajan, što je veliki plus. Sviđa mi se što su sastojci etički nabavljeni. Definitivno preporučujem svima koji žele prirodnu, ali luksuznu negu tela.',
  },
]
