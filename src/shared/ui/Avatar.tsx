import { cn } from '@/shared/lib/cn'

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-xl',
  xl: 'size-28 text-4xl',
} as const

const palettes = [
  'from-teal-500 to-emerald-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-fuchsia-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
]

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || '?'
  )
}

function paletteFor(name: string): string {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return palettes[hash % palettes.length]!
}

export interface AvatarProps {
  src?: string | null
  name: string
  size?: keyof typeof sizes
  className?: string
}

/** Foydalanuvchi rasmi; rasm yo'q bo'lsa — ism bosh harflari (rangi ismga qarab doimiy). */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const base = cn('shrink-0 rounded-full select-none', sizes[size], className)
  if (src) return <img src={src} alt={name} className={cn(base, 'object-cover')} />
  return (
    <div
      aria-label={name}
      className={cn(
        base,
        'flex items-center justify-center bg-gradient-to-br font-semibold text-white',
        paletteFor(name),
      )}
    >
      {initials(name)}
    </div>
  )
}
