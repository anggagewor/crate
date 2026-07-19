/**
 * Format number as Indonesian Rupiah currency.
 */
export function formatCurrency(
  value: number,
  options: { locale?: string; currency?: string } = {},
): string {
  const { locale = 'id-ID', currency = 'IDR' } = options
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format number with thousand separators.
 */
export function formatNumber(value: number, locale = 'id-ID'): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format a Date or ISO string to localized date string.
 */
export function formatDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
  locale = 'id-ID',
): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(locale, options).format(date)
}

/**
 * Format a Date or ISO string as relative time (e.g. "3 jam yang lalu").
 */
export function formatRelativeTime(value: Date | string, locale = 'id-ID'): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(diffSec) < 60) return rtf.format(-diffSec, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(-diffMin, 'minute')
  if (Math.abs(diffHour) < 24) return rtf.format(-diffHour, 'hour')
  if (Math.abs(diffDay) < 30) return rtf.format(-diffDay, 'day')

  return formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' }, locale)
}
