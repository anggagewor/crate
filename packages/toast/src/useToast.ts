import { useToastStore, type ToastOptions } from './store'

/**
 * Composable for showing toast notifications anywhere in the app.
 *
 * @example
 * ```ts
 * const toast = useToast()
 * toast.success('Data berhasil disimpan!')
 * toast.error('Gagal menyimpan data.')
 * ```
 */
export function useToast() {
  const store = useToastStore()

  return {
    add: (options: ToastOptions) => store.add(options),
    success: store.success,
    error: store.error,
    warning: store.warning,
    info: store.info,
    dismiss: store.dismiss,
    clear: store.clear,
  }
}
