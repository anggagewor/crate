<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface Props {
  data: ChartData<'line'>
  options?: ChartOptions<'line'>
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const defaultOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12 },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 } },
    },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: { font: { size: 11 } },
    },
  },
}

const mergedOptions = { ...defaultOptions, ...props.options }
</script>

<template>
  <div :style="{ height: `${height}px` }">
    <Line :data="data" :options="mergedOptions" />
  </div>
</template>
