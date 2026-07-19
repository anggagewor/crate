import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PurdiaAuth',
      fileName: 'purdia-auth',
    },
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia', '@purdia/crypto'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          '@purdia/crypto': 'PurdiaCrypto',
        },
      },
    },
  },
})
