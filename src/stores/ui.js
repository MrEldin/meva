import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Presentation state shared between layout and pages: which kind of surface
 * currently sits under the fixed header, so it can switch between ink and
 * paper as the visitor scrolls from a dark scene into a light one.
 */
export const useUiStore = defineStore('ui', () => {
  const surface = ref('light')

  return { surface }
})
