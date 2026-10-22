import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useAuthStore, useCapability } from '@/features/auth'
import { PageSpinner } from '@/shared/ui'

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const location = useLocation()
  if (status === 'idle' || status === 'loading') return <PageSpinner />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  if (status === 'idle' || status === 'loading') return <PageSpinner />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return children
}

/** Huquq bo'lmasa /403. Backend baribir tekshiradi — bu faqat qulaylik. */
export function RequireCapability({ cap, children }: { cap: string; children: ReactNode }) {
  const allowed = useCapability(cap)
  if (!allowed) return <Navigate to="/403" replace />
  return children
}
