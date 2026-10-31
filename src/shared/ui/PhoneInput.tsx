import type { ComponentProps } from 'react'
import { forwardRef } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatUzPhone } from '@/shared/lib/phone'

export interface PhoneInputProps extends Omit<ComponentProps<'input'>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  invalid?: boolean
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, invalid, className, ...rest }, ref) => {
    // Agar qiymat bo'sh bo'lsa boshlang'ich '+998 ' qilib olamiz
    const displayValue = value ? (value.startsWith('+998') ? formatUzPhone(value) : formatUzPhone('+998' + value)) : '+998 '

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      // Agar foydalanuvchi hamma narsani o'chirib yuborsa
      if (!raw || raw.length < 5) {
        onChange?.('')
        return
      }

      // Formatlangan ko'rinish
      const formatted = formatUzPhone(raw)
      onChange?.(formatted)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // +998 prefiksini o'chirishga ruxsat bermaslik
      const target = e.currentTarget
      const start = target.selectionStart ?? 0
      if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && start <= 5) {
        if (e.key === 'Backspace') {
          e.preventDefault()
        }
      }
    }

    return (
      <div className="relative flex items-center">
        <input
          {...rest}
          ref={ref}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="+998 (__) ___-__-__"
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 transition-colors',
            'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
            invalid
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-100',
            className
          )}
        />
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
