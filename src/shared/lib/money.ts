/**
 * Pul va miqdor API da satr ("12500.00") — float emas. Bu yerda faqat ko'rsatish/formatlash.
 * Yakuniy summalar doim backend dan keladi.
 */
const LOCALE = 'uz-Latn-UZ'
const formatters = new Map<string, Intl.NumberFormat>()

function formatter(decimals: number): Intl.NumberFormat {
  const key = String(decimals)
  let fmt = formatters.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    formatters.set(key, fmt)
  }
  return fmt
}

export function formatNumber(value: string | number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return String(value)
  return formatter(decimals).format(num)
}

export function formatMoney(
  value: string | number | null | undefined,
  currency?: string,
  decimals = 2,
): string {
  const text = formatNumber(value, decimals)
  return currency && text !== '—' ? `${text} ${currency}` : text
}
