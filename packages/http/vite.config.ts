import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PurdiaHttp',
      fileName: 'purdia-http',
    },
    rollupOptions: {
      external: ['axios', '@purdia/crypto'],
      output: {
        globals: {
          axios: 'axios',
          '@purdia/crypto': 'PurdiaCrypto',
        },
      },
    },
  },
})
