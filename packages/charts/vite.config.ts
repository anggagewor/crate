import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PurdiaCharts',
      fileName: 'purdia-charts',
    },
    rollupOptions: {
      external: ['vue', 'chart.js', 'vue-chartjs'],
      output: {
        globals: {
          vue: 'Vue',
          'chart.js': 'ChartJS',
          'vue-chartjs': 'VueChartJS',
        },
      },
    },
  },
})
