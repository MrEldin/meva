<script setup>
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { watch } from 'vue'

/**
 * The description, written rather than coded.
 *
 * The descriptions came out of WooCommerce as HTML -- headings, bold,
 * bulleted ingredient lists -- and the desk showed them as raw markup in a
 * plain textarea. Nobody writing a product description should have to know
 * what a <ul> is, and one missing closing tag broke the page. This is the
 * same HTML, edited as text: the buttons above do what the tags did.
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Link.configure({ openOnClick: false, autolink: true }),
  ],
  editorProps: {
    attributes: {
      class: 'prose-desk min-h-[18rem] px-4 py-3.5 outline-none',
    },
  },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

// Loading a product after the editor exists must replace what is in it.
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value ?? '', false)
    }
  },
)

const BUTTONS = [
  { key: 'bold', title: 'Podebljano', run: (e) => e.chain().focus().toggleBold().run(), on: (e) => e.isActive('bold') },
  { key: 'italic', title: 'Kurziv', run: (e) => e.chain().focus().toggleItalic().run(), on: (e) => e.isActive('italic') },
  { key: 'h2', title: 'Naslov', run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), on: (e) => e.isActive('heading', { level: 2 }) },
  { key: 'h3', title: 'Podnaslov', run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), on: (e) => e.isActive('heading', { level: 3 }) },
  { key: 'ul', title: 'Lista', run: (e) => e.chain().focus().toggleBulletList().run(), on: (e) => e.isActive('bulletList') },
  { key: 'ol', title: 'Numerisana lista', run: (e) => e.chain().focus().toggleOrderedList().run(), on: (e) => e.isActive('orderedList') },
  { key: 'link', title: 'Link', run: setLink, on: (e) => e.isActive('link') },
  { key: 'clear', title: 'Očisti formatiranje', run: (e) => e.chain().focus().unsetAllMarks().clearNodes().run(), on: () => false },
]

function setLink(e) {
  if (e.isActive('link')) return e.chain().focus().unsetLink().run()

  const href = window.prompt('Adresa linka:', 'https://')

  if (href) e.chain().focus().setLink({ href }).run()
}
</script>

<template>
  <div v-if="editor" class="overflow-hidden rounded-xl border border-forest/12 bg-paper focus-within:border-clay-400">
    <div class="flex flex-wrap items-center gap-0.5 border-b border-forest/8 bg-cream px-2 py-1.5">
      <button
        v-for="button in BUTTONS"
        :key="button.key"
        type="button"
        class="grid h-8 w-8 place-items-center rounded-lg text-forest/70 transition-colors hover:bg-sand hover:text-forest"
        :class="button.on(editor) ? 'bg-forest text-white hover:bg-forest hover:text-white' : ''"
        :title="button.title"
        :aria-label="button.title"
        @click="button.run(editor)"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <template v-if="button.key === 'bold'"><path d="M7 5h6.5a3.5 3.5 0 0 1 0 7H7zM7 12h7.5a3.5 3.5 0 0 1 0 7H7z" /></template>
          <template v-else-if="button.key === 'italic'"><path d="M15 5h-5M14 19H9M13.5 5 10.5 19" /></template>
          <template v-else-if="button.key === 'h2'"><path d="M5 6v12M12 6v12M5 12h7M16.5 18h4M16.5 18c0-2.5 4-3 4-5.2a2 2 0 0 0-3.9-.6" /></template>
          <template v-else-if="button.key === 'h3'"><path d="M5 6v12M12 6v12M5 12h7M16.6 11.5a2 2 0 1 1 1.6 3.2 2 2 0 1 1-1.6 3.2" /></template>
          <template v-else-if="button.key === 'ul'"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></template>
          <template v-else-if="button.key === 'ol'"><path d="M10 6h10M10 12h10M10 18h10M4 6h1v4M4 14.5h2v1.5H4V18h2" /></template>
          <template v-else-if="button.key === 'link'"><path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.2 1.2" /><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.2-1.2" /></template>
          <template v-else><path d="M4 7h16M9 11v6M15 11v6M6 7l1 12.5a2 2 0 0 0 2 1.5h6a2 2 0 0 0 2-1.5L18 7" /></template>
        </svg>
      </button>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>
