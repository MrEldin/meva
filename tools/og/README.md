# The share card

`public/og-image.jpg` is the picture WhatsApp, Viber, Messenger and Facebook
draw when someone sends a link to the shop. It is a composed card rather than a
photograph, because a card has to sell in the two seconds someone looks at it:
the wordmark, what the shop makes, the number of orders behind it, and the two
things people ask before buying.

Rebuild it after changing `card.html`:

    ./tools/og/build.sh

The size matters. It must be exactly 1200×630 — the share page declares the real
dimensions and a mismatch collapses the card to the small one-line preview — and
it should stay well under 300 KB so a phone on a slow connection still gets it.

Messengers cache these hard. After replacing the file, send the link with a
query string (`https://meva.life/?v=2`) to see the new card, or clear the cache
through Facebook's sharing debugger.
