import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PurdiaUI',
      fileName: 'purdia-ui',
    },
    rollupOptions: {
      external: ['vue', 'vue-router', /^@lucide\//, /^@tiptap\//, /^lowlight/],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
})
