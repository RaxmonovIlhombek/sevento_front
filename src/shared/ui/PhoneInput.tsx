import type { ComponentProps } from 'react'
import { forwardRef } from 'react'

import { cn } from '@/shared/lib/cn'

export interface PhoneInputProps extends Omit<ComponentProps<'input'>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  invalid?: boolean
}

/**
 * O'zbekiston telefon raqamlari uchun formatlangan kiritish maydoni.
 * Doimo "+998 " bilan boshlanadi, harflarni kiritishga yo'l qo'ymaydi,
 * faqat raqamlar qabul qilinadi va "+998 (90) 123-45-67" formatida chiroyli ko'rsatiladi.
 */
export function formatUzPhone(input: string): string {
  if (!input) return '+998 '
  // Barcha no-raqamlarni tozalaymiz
  let digits = input.replace(/\D/g, '')

  // Agar 998 bilan boshlangan bo'lsa uni olib tashlaymiz
  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }

  // Maksimal 9 ta raqam (operator kodi + 7 xonali raqam)
  digits = digits.slice(0, 9)

  let formatted = '+998'
  if (digits.length > 0) {
    formatted += ' (' + digits.slice(0, 2)
  }
  if (digits.length >= 2) {
    formatted += ') ' + digits.slice(2, 5)
  }
  if (digits.length >= 5) {
    formatted += '-' + digits.slice(5, 7)
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(7, 9)
  }

  return formatted
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, invalid, className, ...rest }, ref) => {
    // Agar qiymat bo'sh bo'lsa boshlang'ich '+998 ' qilib olamiz
    const displayValue = value ? (value.startsWith('+998') ? formatUzPhone(value) : formatUzPhone('+998' + value)) : '+998 '

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value
      // Agar foydalanuvchi +998 ni ham o'chirib yubormoqchi bo'lsa, uni saqlab qolamiz
      const cleaned = formatUzPhone(rawVal)
      if (onChange) {
        onChange(cleaned)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // "+998 " qismidan oldinga o'chirishga (Backspace) yo'l qo'ymaslik
      const input = e.currentTarget
      if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        input.selectionStart !== null &&
        input.selectionStart <= 5 &&
        input.selectionEnd !== null &&
        input.selectionEnd <= 5
      ) {
        e.preventDefault()
      }
    }

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'block h-10 w-full rounded-md border bg-white px-3 font-mono text-sm tracking-wide text-slate-900 shadow-sm placeholder:text-slate-400',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-500',
          invalid ? 'border-red-400' : 'border-slate-300',
          className,
        )}
        {...rest}
      />
    )
  },
)

PhoneInput.displayName = 'PhoneInput'
