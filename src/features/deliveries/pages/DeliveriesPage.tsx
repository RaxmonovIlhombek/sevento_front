import { PageHeader } from '@/shared/ui'
import { EmptyState } from '@/shared/ui'

/**
 * Kuryer sahifasi (skelet). Yetkazishlar ro'yxati, holat o'zgartirish va manzil
 * backend endpoint'lari tayyor bo'lganda ulanadi.
 */
export function DeliveriesPage() {
  return (
    <div>
      <PageHeader title="Yetkazishlar" subtitle="Sizga biriktirilgan buyurtmalar" />
      <EmptyState text="Yetkazishlar moduli hali ulanmagan. Backend tayyor bo'lgach, buyurtmalaringiz shu yerda chiqadi." />
    </div>
  )
}
