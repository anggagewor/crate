<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data: ChartData<'bar'>
  options?: ChartOptions<'bar'>
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const defaultOptions: ChartOptions<'bar'> = {
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
    <Bar :data="data" :options="mergedOptions" />
  </div>
</template>
