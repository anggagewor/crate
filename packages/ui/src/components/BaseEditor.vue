<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  ImageIcon,
  Highlighter,
  Palette,
  CodeXml,
  RemoveFormatting,
} from '@lucide/vue'

export type EditorVariant = 'default' | 'minimal' | 'full'
export type EditorSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue?: string
  variant?: EditorVariant
  size?: EditorSize
  placeholder?: string
  disabled?: boolean
  label?: string
  hint?: string
  error?: string
  maxHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  variant: 'default',
  size: 'md',
  placeholder: 'Tulis sesuatu...',
  disabled: false,
  maxHeight: '400px',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Placeholder.configure({ placeholder: props.placeholder }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Underline,
    Link.configure({ openOnClick: false }),
    Image,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TaskList,
    TaskItem.configure({ nested: true }),
  ],
  onUpdate: () => {
    emit('update:modelValue', editor.value?.getHTML() ?? '')
  },
})

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val, {
        emitUpdate: false,
      })
    }
  },
)

watch(
  () => props.disabled,
  (val) => {
    editor.value?.setEditable(!val)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  const previousUrl = editor.value?.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function addImage() {
  const url = window.prompt('Image URL')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

function setColor() {
  const color = window.prompt('Warna (hex)', '#ff0000')
  if (color) {
    editor.value?.chain().focus().setColor(color).run()
  }
}

function setHighlight() {
  const color = window.prompt('Highlight color (hex)', '#fef08a')
  if (color) {
    editor.value?.chain().focus().toggleHighlight({ color }).run()
  }
}

// Toolbar sections based on variant
const showFormatting = computed(() => props.variant !== 'minimal')
const showAlignment = computed(() => props.variant === 'full')
const showAdvanced = computed(() => props.variant === 'full')

const sizeClasses = computed(() => {
  const map: Record<EditorSize, { minHeight: string; text: string }> = {
    sm: { minHeight: 'min-h-[120px]', text: 'text-sm' },
    md: { minHeight: 'min-h-[200px]', text: 'text-sm' },
    lg: { minHeight: 'min-h-[300px]', text: 'text-base' },
  }
  return map[props.size]
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>

    <div
      class="border rounded-lg overflow-hidden transition-all"
      :class="[
        error
          ? 'border-red-500'
          : 'border-gray-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 dark:border-gray-600 dark:focus-within:ring-primary-900/30',
        disabled ? 'opacity-50' : '',
      ]"
    >
      <!-- Toolbar -->
      <div
        v-if="editor"
        class="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <!-- Basic formatting -->
        <button
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('bold')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Bold"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <Bold class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('italic')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Italic"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <Italic class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('underline')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Underline"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <UnderlineIcon class="w-4 h-4" />
        </button>
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('strike')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Strikethrough"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <Strikethrough class="w-4 h-4" />
        </button>
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('code')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Inline Code"
          @click="editor.chain().focus().toggleCode().run()"
        >
          <Code class="w-4 h-4" />
        </button>

        <!-- Separator -->
        <div class="w-px h-5 bg-gray-300 mx-1 dark:bg-gray-600" />

        <!-- Headings -->
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('heading', { level: 1 })
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Heading 1"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <Heading1 class="w-4 h-4" />
        </button>
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('heading', { level: 2 })
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Heading 2"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <Heading2 class="w-4 h-4" />
        </button>
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('heading', { level: 3 })
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Heading 3"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <Heading3 class="w-4 h-4" />
        </button>

        <!-- Separator -->
        <div v-if="showFormatting" class="w-px h-5 bg-gray-300 mx-1 dark:bg-gray-600" />

        <!-- Lists -->
        <button
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('bulletList')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Bullet List"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <List class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('orderedList')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Ordered List"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <ListOrdered class="w-4 h-4" />
        </button>
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('taskList')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Task List"
          @click="editor.chain().focus().toggleTaskList().run()"
        >
          <ListTodo class="w-4 h-4" />
        </button>

        <!-- Separator -->
        <div v-if="showFormatting" class="w-px h-5 bg-gray-300 mx-1 dark:bg-gray-600" />

        <!-- Block elements -->
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('blockquote')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Blockquote"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <Quote class="w-4 h-4" />
        </button>
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
          :class="
            editor.isActive('codeBlock')
              ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
              : 'text-gray-600 dark:text-gray-400'
          "
          title="Code Block"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <CodeXml class="w-4 h-4" />
        </button>
        <button
          v-if="showFormatting"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors dark:hover:bg-gray-700 dark:text-gray-400"
          title="Horizontal Rule"
          @click="editor.chain().focus().setHorizontalRule().run()"
        >
          <Minus class="w-4 h-4" />
        </button>

        <!-- Alignment (full only) -->
        <template v-if="showAlignment">
          <div class="w-px h-5 bg-gray-300 mx-1 dark:bg-gray-600" />
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
            :class="
              editor.isActive({ textAlign: 'left' })
                ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400'
            "
            title="Align Left"
            @click="editor.chain().focus().setTextAlign('left').run()"
          >
            <AlignLeft class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
            :class="
              editor.isActive({ textAlign: 'center' })
                ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400'
            "
            title="Align Center"
            @click="editor.chain().focus().setTextAlign('center').run()"
          >
            <AlignCenter class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
            :class="
              editor.isActive({ textAlign: 'right' })
                ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400'
            "
            title="Align Right"
            @click="editor.chain().focus().setTextAlign('right').run()"
          >
            <AlignRight class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
            :class="
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400'
            "
            title="Justify"
            @click="editor.chain().focus().setTextAlign('justify').run()"
          >
            <AlignJustify class="w-4 h-4" />
          </button>
        </template>

        <!-- Advanced (full only) -->
        <template v-if="showAdvanced">
          <div class="w-px h-5 bg-gray-300 mx-1 dark:bg-gray-600" />
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400"
            :class="editor.isActive('link') ? 'bg-gray-200 text-primary-600 dark:bg-gray-700' : ''"
            title="Link"
            @click="setLink"
          >
            <LinkIcon class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors dark:hover:bg-gray-700 dark:text-gray-400"
            title="Image"
            @click="addImage"
          >
            <ImageIcon class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors dark:hover:bg-gray-700 dark:text-gray-400"
            title="Text Color"
            @click="setColor"
          >
            <Palette class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded hover:bg-gray-200 transition-colors dark:hover:bg-gray-700"
            :class="
              editor.isActive('highlight')
                ? 'bg-gray-200 text-primary-600 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400'
            "
            title="Highlight"
            @click="setHighlight"
          >
            <Highlighter class="w-4 h-4" />
          </button>
        </template>

        <!-- Separator -->
        <div class="w-px h-5 bg-gray-300 mx-1 dark:bg-gray-600" />

        <!-- Clear formatting (full) -->
        <button
          v-if="showAdvanced"
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors dark:hover:bg-gray-700 dark:text-gray-400"
          title="Clear Formatting"
          @click="editor.chain().focus().clearNodes().unsetAllMarks().run()"
        >
          <RemoveFormatting class="w-4 h-4" />
        </button>

        <!-- Undo / Redo -->
        <button
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors dark:hover:bg-gray-700 dark:text-gray-400 disabled:opacity-30"
          title="Undo"
          :disabled="!editor.can().undo()"
          @click="editor.chain().focus().undo().run()"
        >
          <Undo2 class="w-4 h-4" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors dark:hover:bg-gray-700 dark:text-gray-400 disabled:opacity-30"
          title="Redo"
          :disabled="!editor.can().redo()"
          @click="editor.chain().focus().redo().run()"
        >
          <Redo2 class="w-4 h-4" />
        </button>
      </div>

      <!-- Editor Content -->
      <EditorContent
        :editor="editor"
        class="editor-content bg-white dark:bg-gray-800"
        :class="[sizeClasses.minHeight, sizeClasses.text]"
        :style="{ maxHeight: maxHeight, overflowY: 'auto' }"
      />
    </div>

    <span v-if="error" class="text-xs text-red-500">{{ error }}</span>
    <span v-else-if="hint" class="text-xs text-gray-500 dark:text-gray-400">{{ hint }}</span>
  </div>
</template>

<style>
.editor-content .tiptap {
  padding: 0.75rem 1rem;
  outline: none;
}

.editor-content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

.editor-content .tiptap h1 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 1rem 0 0.5rem;
}

.editor-content .tiptap h2 {
  font-size: 1.375rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0.75rem 0 0.5rem;
}

.editor-content .tiptap h3 {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  margin: 0.5rem 0 0.25rem;
}

.editor-content .tiptap p {
  margin: 0.25rem 0;
}

.editor-content .tiptap ul,
.editor-content .tiptap ol {
  padding-left: 1.5rem;
  margin: 0.25rem 0;
}

.editor-content .tiptap ul {
  list-style: disc;
}

.editor-content .tiptap ol {
  list-style: decimal;
}

.editor-content .tiptap ul[data-type='taskList'] {
  list-style: none;
  padding-left: 0;
}

.editor-content .tiptap ul[data-type='taskList'] li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.editor-content .tiptap ul[data-type='taskList'] li label {
  margin-top: 0.2rem;
}

.editor-content .tiptap blockquote {
  border-left: 3px solid #d1d5db;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #6b7280;
  font-style: italic;
}

.editor-content .tiptap code {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  padding: 0.15rem 0.4rem;
  font-size: 0.85em;
  font-family: ui-monospace, monospace;
}

.editor-content .tiptap pre {
  background-color: #1f2937;
  color: #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  overflow-x: auto;
  font-family: ui-monospace, monospace;
  font-size: 0.85em;
}

.editor-content .tiptap pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  color: inherit;
}

.editor-content .tiptap hr {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 1rem 0;
}

.editor-content .tiptap a {
  color: #4f46e5;
  text-decoration: underline;
  cursor: pointer;
}

.editor-content .tiptap img {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

.editor-content .tiptap mark {
  border-radius: 0.15rem;
  padding: 0.1rem 0.2rem;
}
</style>
