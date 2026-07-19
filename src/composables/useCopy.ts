import { ref } from 'vue'
import { useToast } from '@purdia/toast'

export function useCopy() {
  const copied = ref(false)

  async function copy(text: string) {
    const toast = useToast()
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      toast.success('Copied to clipboard')
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      copied.value = true
      toast.success('Copied to clipboard')
      setTimeout(() => {
        copied.value = false
      }, 2000)
    }
  }

  return { copied, copy }
}
