<script setup>
import { track } from '@/lib/tracking'
import { computed, ref } from 'vue'

/**
 * Send this page to someone.
 *
 * On a phone the system share sheet is offered first -- it reaches whatever
 * the person actually uses -- with WhatsApp, Viber, Facebook and a copy button
 * behind it for everyone else.
 */
const props = defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
  url: { type: String, default: null },
  label: { type: String, default: 'Podeli' },
  id: { type: String, default: null },
})

const copied = ref(false)
const href = computed(() => props.url ?? window.location.href)
const message = computed(() => `${props.title}${props.text ? ` — ${props.text}` : ''}`)

const targets = computed(() => [
  { name: 'WhatsApp', channel: 'whatsapp', href: `https://wa.me/?text=${encodeURIComponent(`${message.value} ${href.value}`)}` },
  { name: 'Viber', channel: 'viber', href: `viber://forward?text=${encodeURIComponent(`${message.value} ${href.value}`)}` },
  { name: 'Facebook', channel: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(href.value)}` },
  { name: 'X', channel: 'x', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message.value)}&url=${encodeURIComponent(href.value)}` },
])

const canShareNatively = typeof navigator !== 'undefined' && Boolean(navigator.share)

async function shareNatively() {
  try {
    await navigator.share({ title: props.title, text: props.text, url: href.value })
    track.share('native', props.id)
  } catch { /* the sheet was dismissed */ }
}

async function copy() {
  await navigator.clipboard.writeText(href.value)
  copied.value = true
  track.share('copy', props.id)
  setTimeout(() => (copied.value = false), 1800)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="eyebrow mr-1 text-[0.5625rem] text-forest/45">{{ label }}</span>

    <button
      v-if="canShareNatively"
      type="button"
      class="flex h-10 items-center gap-2 rounded-full border border-forest/15 px-4 text-xs transition-colors hover:bg-forest hover:text-cream"
      @click="shareNatively"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-4 w-4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v13M8 7l4-4 4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
      </svg>
      Pošalji
    </button>

    <a
      v-for="target in targets"
      :key="target.channel"
      :href="target.href"
      target="_blank"
      rel="noopener"
      class="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 transition-colors hover:bg-forest hover:text-cream"
      :aria-label="`Podeli na ${target.name}`"
      :title="target.name"
      @click="track.share(target.channel, id)"
    >
      <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
        <path v-if="target.channel === 'whatsapp'" d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.8c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6a9.6 9.6 0 0 0 3.8 3.3c1.8.7 1.8.5 2.2.5.3 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1l-.3-.4Z" />
        <path v-else-if="target.channel === 'viber'" d="M12 2C6.9 2 3 5.3 3 9.9c0 2.5 1.2 4.6 3.2 6v4l3.3-2c.8.2 1.6.3 2.5.3 5.1 0 9-3.3 9-7.9S17.1 2 12 2Zm0 14.4c-.8 0-1.6-.1-2.3-.3l-.5-.2-1.8 1.1v-2.2l-.4-.3A6.1 6.1 0 0 1 4.5 9.9C4.5 6.3 7.8 3.5 12 3.5s7.5 2.8 7.5 6.4-3.3 6.5-7.5 6.5Zm3.5-4.2-1-.5c-.2-.1-.4-.1-.5.1l-.5.6-1.2-.6a4.8 4.8 0 0 1-1.6-1.6l-.5-1 .6-.6c.1-.1.2-.3.1-.5l-.5-1c-.1-.3-.4-.3-.6-.2-.5.2-1.2.6-1.2 1.4 0 1.5 1.5 3.4 2.6 4.2 1 .8 2.6 1.6 3.7 1.2.7-.2 1-.9 1.1-1.4 0-.2 0-.4-.2-.5Z" />
        <path v-else-if="target.channel === 'facebook'" d="M14 8.5V7c0-.7.2-1 1-1h1.5V3.2A20 20 0 0 0 14.3 3C11.9 3 10.5 4.4 10.5 7v1.5H8V12h2.5v9H14v-9h2.4l.4-3.5H14Z" />
        <path v-else d="M17.5 3h3l-6.6 7.5L21.8 21h-6l-4.7-6.1L5.7 21H2.6l7-8-6.7-10h6.2l4.3 5.7L17.5 3Zm-1 16h1.7L7.6 4.7H5.8L16.5 19Z" />
      </svg>
    </a>

    <button
      type="button"
      class="flex h-10 items-center gap-2 rounded-full border border-forest/15 px-4 text-xs transition-colors hover:bg-forest hover:text-cream"
      @click="copy"
    >
      {{ copied ? 'Kopirano ✓' : 'Kopiraj link' }}
    </button>
  </div>
</template>
