<script setup>
import { money } from '@/lib/money'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <div class="shell py-14 md:py-20">
    <h1 class="font-display text-4xl text-ink md:text-5xl">Korpa</h1>

    <div v-if="!cart.lines.length" class="py-20 text-center md:py-28">
      <p class="font-display text-2xl text-mist-400">Korpa je prazna</p>
      <RouterLink :to="{ name: 'catalog' }" class="eyebrow mt-8 inline-block bg-ink px-9 py-4 text-paper transition-colors hover:bg-clay-500">
        Pogledaj proizvode
      </RouterLink>
    </div>

    <div v-else class="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
      <ul class="divide-y divide-mist-200 border-y border-mist-200">
        <li v-for="line in cart.lines" :key="line.id" class="flex gap-4 py-6 md:gap-6">
          <RouterLink :to="{ name: 'product', params: { slug: line.slug } }" class="w-24 shrink-0 md:w-28">
            <div class="aspect-square overflow-hidden bg-mist-50">
              <img v-if="line.image" :src="line.image" :alt="line.name" class="h-full w-full object-cover" />
            </div>
          </RouterLink>

          <div class="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <RouterLink :to="{ name: 'product', params: { slug: line.slug } }" class="font-display text-lg leading-snug text-ink transition-colors hover:text-clay-600">
                {{ line.name }}
              </RouterLink>
              <p class="mt-1 text-sm font-light tabular-nums text-mist-500">{{ money(line.price) }}</p>
            </div>

            <div class="mt-4 flex items-center justify-between gap-4">
              <div class="flex items-center border border-mist-200">
                <button type="button" class="h-10 w-10 text-mist-500 transition-colors hover:text-ink" aria-label="Manje" @click="cart.setQuantity(line.id, line.quantity - 1)">−</button>
                <span class="w-8 text-center text-sm tabular-nums">{{ line.quantity }}</span>
                <button type="button" class="h-10 w-10 text-mist-500 transition-colors hover:text-ink" aria-label="Više" @click="cart.setQuantity(line.id, line.quantity + 1)">+</button>
              </div>

              <div class="flex items-center gap-5">
                <span class="text-sm tabular-nums text-ink">{{ money(line.price * line.quantity) }}</span>
                <button type="button" class="text-xs font-light text-mist-400 underline underline-offset-4 transition-colors hover:text-clay-600" @click="cart.remove(line.id)">
                  Ukloni
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <aside class="lg:sticky lg:top-28 lg:self-start">
        <div class="bg-mist-50 p-7">
          <h2 class="eyebrow text-mist-500">Pregled</h2>

          <dl class="mt-6 space-y-3 text-sm font-light">
            <div class="flex justify-between text-mist-600">
              <dt>Proizvodi</dt>
              <dd class="tabular-nums">{{ money(cart.subtotal) }}</dd>
            </div>
            <div class="flex justify-between text-mist-600">
              <dt>Dostava</dt>
              <dd class="text-clay-600">Besplatno</dd>
            </div>
          </dl>

          <div class="mt-6 flex items-baseline justify-between border-t border-mist-200 pt-6">
            <span class="eyebrow text-ink">Ukupno</span>
            <span class="font-display text-2xl tabular-nums text-ink">{{ money(cart.subtotal) }}</span>
          </div>

          <RouterLink :to="{ name: 'checkout' }" class="eyebrow mt-7 block bg-ink py-4.5 text-center text-paper transition-colors duration-400 hover:bg-clay-500">
            Nastavi ka poručivanju
          </RouterLink>

          <p class="mt-4 text-center text-xs font-light text-mist-400">Plaćanje pouzećem</p>
        </div>
      </aside>
    </div>
  </div>
</template>
