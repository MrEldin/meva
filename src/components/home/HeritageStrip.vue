<script setup>
import oldTown from '@/assets/img/novi-pazar-1982.webp'
import { FOUNDED, yearsLabel } from '@/lib/heritage'

/**
 * The year, under the hero: the old bazaar on one side, the sentence the
 * client wanted said on the other.
 *
 * The strip itself runs from one edge of the screen to the other, cut in two
 * equal halves; what is written in it keeps to the page's container. The year
 * starts under the wordmark and the last words end under the last link of the
 * navigation -- unless that would put the year on the minaret, in which case
 * it steps right of it. It stands near the top, in the sky. The haze behind it is
 * the strip's own colour: it hangs from the top edge, reaches just under the
 * year, and is gone before the roofs -- the town stays as it is. On a phone the
 * halves stack.
 */
</script>

<template>
  <section class="bg-shell-deep text-ink" aria-label="Meva od 1982.">
    <div>
      <div class="grid lg:grid-cols-2">
        <div class="relative h-[6.5rem] overflow-hidden sm:h-[8.5rem] lg:h-auto lg:min-h-[8rem]">
          <img
            :src="oldTown"
            alt="Stara čaršija u Novom Pazaru"
            width="1400"
            height="887"
            loading="lazy"
            decoding="async"
            class="photo absolute inset-0 h-full w-full object-cover"
          />
          <p class="year absolute flex items-center gap-3 sm:gap-4">
            <span class="font-display lining-nums text-[2.25rem] font-semibold leading-none sm:text-[3rem] lg:text-[2.5rem]">{{ FOUNDED }}.</span>
            <span class="text-[0.625rem] font-bold uppercase leading-[1.5] tracking-[0.2em] text-ink/80 sm:text-[0.6875rem]">
              Početak priče<br />u Novom Pazaru
            </span>
          </p>
        </div>

        <div class="grid items-center gap-4 px-5 py-6 sm:py-8 sm:grid-cols-[auto_1fr] sm:gap-0 sm:px-10 words lg:py-3 min-[90rem]:grid-cols-[auto_1fr_auto]">
          <h2 class="font-display lining-nums text-[1.5rem] leading-[1.2] sm:text-[1.875rem] sm:pr-7 lg:text-[1.5rem]">
            <span class="block text-blush-700">Više od {{ yearsLabel() }}</span>
            posvećenosti <br class="hidden sm:block" />vašoj koži.
          </h2>

          <p class="max-w-[24rem] text-[0.9375rem] leading-[1.7] text-ink/80 sm:border-l sm:border-ink/15 sm:pl-7 lg:leading-[1.6] min-[90rem]:text-[0.875rem]">
            Od male porodične radionice do brenda kome veruju generacije. I dalje verujemo u prirodu, ljude i kvalitet.
          </p>

          <p class="border-t border-ink/15 pt-4 text-center sm:col-span-2 sm:mt-7 lg:max-[89.99rem]:hidden min-[90rem]:col-span-1 min-[90rem]:ml-6 min-[90rem]:mt-0 min-[90rem]:border-l min-[90rem]:border-t-0 min-[90rem]:pl-6 min-[90rem]:pt-0">
            <span class="signature block text-[2.75rem] leading-[0.9] sm:text-[3.25rem] min-[90rem]:text-[2.75rem] text-blush-700" aria-hidden="true">Meva</span>
            <span class="mt-2 block text-[0.6875rem] min-[90rem]:mt-1 min-[90rem]:text-[0.625rem] font-bold uppercase leading-[1.5] tracking-[0.22em] text-ink/75">Tradicija<br class="hidden min-[90rem]:block" /> koja traje</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Where the photograph sits in its frame. The frame is much wider than the
 * photograph is tall, so only a band of it shows, and the second number picks
 * the band: 0% is the very top of the photograph (all sky), 100% the very
 * bottom (street and walls). Raise it to see more of the houses, lower it to
 * see more sky. The first number would slide it sideways, but the photograph
 * is already as wide as the frame, so it does nothing here.
 */
.photo {
  object-position: 50% 54%;
}

/*
 * The year. `--gutter` is where the container's content starts, measured from
 * the screen's edge -- the same sum the `shell` utility does. The year starts
 * there, or at 17.5% of the photograph if that is further right: the minaret
 * stands at 9-15%, and on a narrow desktop the container starts on top of it.
 */
.year {
  --top: 1rem;
  --gutter: 0px;
  top: var(--top);
  left: max(17.5%, var(--gutter));
  /* Its own stacking context, so the haze sits behind the year but in front of the photograph. */
  isolation: isolate;
}

/* The haze: half an ellipse hung from the strip's top edge, centred on the year. */
.year::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: calc(var(--top) * -1) -8rem -3rem;
  background: radial-gradient(
    ellipse 50% 100% at 50% 0,
    rgb(251 239 235 / 0.97),
    rgb(251 239 235 / 0.95) 50%,
    rgb(251 239 235 / 0.72) 72%,
    rgb(251 239 235 / 0.3) 88%,
    rgb(251 239 235 / 0)
  );
}

@media (min-width: 640px) {
  .year { --top: 1.5rem; }
}

@media (min-width: 1024px) {
  .year { --top: 1.375rem; --gutter: calc((100vw - 90rem) / 2 + 2.5rem); }
  /* The words end where the container does. */
  .words { padding-right: max(2.5rem, calc((100vw - 90rem) / 2 + 2.5rem)); }
}

@media (min-width: 1280px) {
  .year { --gutter: calc((100vw - 90rem) / 2 + 4rem); }
  .words { padding-right: max(4rem, calc((100vw - 90rem) / 2 + 4rem)); }
}

/* A signature, loaded for the four letters it is asked to write (see index.html). */
.signature {
  font-family: "Mrs Saint Delafield", var(--font-script);
}
</style>
