import { newIdempotencyKey } from '@/shared/api/client'
import type { Customer, PosProduct } from '@/shared/api/types'

import type { CartLine } from '../store/cart'

const STORAGE_KEY = 'sevento-pos-drafts'

export interface DraftCart {
  id: string
  name: string
  branchId: number | null
  currency: string
  priceTypeId: number | null
  customer: Customer | null
  lines: CartLine[]
  updatedAt: string // ISO-8601
}

function readAll(): DraftCart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function writeAll(drafts: DraftCart[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch {
    /* localStorage to'ldirilgan — draftni saqlmaymiz */
  }
}

/** Barcha saqlangan savatlar (yangiylar oldinda). */
export function listDrafts(): DraftCart[] {
  return readAll().sort((a, b) =>
    b.updatedAt > a.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0,
  )
}

/** Savatni saqlash (yangi draft). */
export function saveDraft(draft: Omit<DraftCart, 'id' | 'updatedAt'>): DraftCart {
  const now = new Date().toISOString()
  const entry: DraftCart = { ...draft, id: newIdempotencyKey(), updatedAt: now }
  writeAll([entry, ...readAll()])
  return entry
}

/** ID bo'yicha draftni topish. */
export function loadDraft(id: string): DraftCart | null {
  return readAll().find((d) => d.id === id) ?? null
}

/** Draftni o'chirish. */
export function deleteDraft(id: string): void {
  writeAll(readAll().filter((d) => d.id !== id))
}

export type { PosProduct }
