# Meva Storefront

Vue 3 front end for the Meva Cosmetics shop. Talks to the Laravel API in
`~/Dev/Laravel/meva`; nothing is rendered server-side.

```bash
npm install
npm run dev      # http://localhost:5173
```

Vite proxies `/api` and `/storage` to `http://localhost:8000`, so the browser
stays on one origin and there is no CORS handshake in development. Start the API
with `docker compose up` in the Laravel project first.

## Design

Three colours carry the brand: black, white, and the powder pink from the logo
(`#B3617E`). Type is Playfair Display for display and Jost for everything else,
matching the word-mark's Didone serif and wide-tracked sans.

Tokens live in `src/assets/css/app.css` under `@theme` — Tailwind 4 is
configured in CSS, so there is no `tailwind.config.js`.

**The shop is mobile-first, not mobile-friendly.** 92.6% of the old shop's
5,480 orders came from a phone, so the phone layout is the design and the
desktop one is the adaptation.

## Structure

```
src/
├── api/client.js        axios instance, attaches the JWT
├── stores/              catalog, cart (localStorage), auth
├── components/
│   ├── layout/          header, footer
│   ├── product/         product card
│   └── admin/           stat tile, bar list, revenue chart
├── views/               one per route, admin/ for the dashboard
└── directives/reveal.js scroll-reveal, respects reduced motion
```

## Routes

| Path | What |
| --- | --- |
| `/` | Landing |
| `/proizvodi` | Catalogue, filter by category or set, search |
| `/proizvod/:slug` | Product, gallery, set contents, related |
| `/korpa` | Cart |
| `/porucivanje` | Checkout — cash on delivery |
| `/hvala/:reference` | Order confirmation |
| `/prijava` | Sign in |
| `/admin` | Sales dashboard (requires a token) |
