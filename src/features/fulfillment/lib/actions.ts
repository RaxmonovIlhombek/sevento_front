import type { Fulfillment, FulfillmentAction, FulfillmentStatus } from '../api/fulfillment.api'

export const STATUS_LABEL: Record<FulfillmentStatus, string> = {
  pending: 'Omborchi kutmoqda',
  packed: 'Operator tekshiradi',
  ready: 'Tayyor — kuryer kutmoqda',
  on_the_way: "Yo'lda",
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
}

export const STATUS_TONE: Record<
  FulfillmentStatus,
  'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'brand'
> = {
  pending: 'warning',
  packed: 'info',
  ready: 'brand',
  on_the_way: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

export interface ActionSpec {
  action: FulfillmentAction
  label: string
  /** sabab/izoh yozish talab qilinadimi */
  reason?: 'required' | 'optional'
  variant: 'primary' | 'secondary' | 'danger'
}

/**
 * Foydalanuvchi shu buyurtma ustida qaysi tugmalarni ko'radi — huquq + joriy bosqich bo'yicha.
 * Backend baribir tekshiradi; bu faqat keraksiz tugmalarni yashiradi.
 */
export function availableActions(
  order: Pick<Fulfillment, 'status' | 'courier'>,
  capabilities: readonly string[],
  userId: number | null,
): ActionSpec[] {
  const can = (c: string) => capabilities.includes(c)
  const out: ActionSpec[] = []
  if (order.status === 'pending' && can('fulfillment.pack')) {
    out.push({ action: 'pack', label: 'Taxladim', reason: 'optional', variant: 'primary' })
  }
  if (order.status === 'packed' && can('fulfillment.verify')) {
    out.push({ action: 'verify', label: 'Tayyor', reason: 'optional', variant: 'primary' })
    out.push({
      action: 'reject',
      label: 'Qaytarish',
      reason: 'required',
      variant: 'secondary',
    })
  }
  if (order.status === 'ready' && can('deliveries.manage')) {
    out.push({ action: 'accept', label: 'Qabul qildim', variant: 'primary' })
  }
  if (
    order.status === 'on_the_way' &&
    can('deliveries.manage') &&
    (order.courier === userId || can('fulfillment.manage'))
  ) {
    out.push({
      action: 'deliver',
      label: 'Yetib keldim, hammasini berdim',
      reason: 'optional',
      variant: 'primary',
    })
  }
  const open: FulfillmentStatus[] = ['pending', 'packed', 'ready', 'on_the_way']
  if (open.includes(order.status) && can('fulfillment.manage')) {
    out.push({ action: 'cancel', label: 'Bekor qilish', reason: 'required', variant: 'danger' })
  }
  return out
}

/** Sahifa ochilganda qaysi bosqich tanlangan bo'lsin — foydalanuvchi vazifasiga qarab. */
export function defaultTab(capabilities: readonly string[]): FulfillmentStatus | 'all' {
  const can = (c: string) => capabilities.includes(c)
  if (can('fulfillment.view') && !can('fulfillment.pack') && !can('fulfillment.verify')) {
    return 'all'
  }
  if (can('fulfillment.pack')) return 'pending'
  if (can('fulfillment.verify')) return 'packed'
  if (can('deliveries.view')) return 'ready'
  return 'all'
}
