<template>
  <div class="shell flex min-h-[70svh] items-center py-20">
    <div class="mx-auto max-w-md text-center">
      <p class="eyebrow text-clay-500">404</p>
      <h1 class="mt-5 font-display text-4xl text-ink md:text-5xl">Stranica nije pronađena</h1>
      <p class="mt-5 text-base font-light text-mist-600">
        Link je možda zastareo ili je proizvod uklonjen iz ponude.
      </p>
      <RouterLink :to="{ name: 'home' }" class="eyebrow mt-9 inline-block bg-ink px-9 py-4 text-paper transition-colors hover:bg-clay-500">
        Nazad na početnu
      </RouterLink>
    </div>
  </div>
</template>
