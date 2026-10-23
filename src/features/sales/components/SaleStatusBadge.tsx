import { useTranslation } from 'react-i18next'

import type { SaleStatus } from '@/shared/api/types'
import { Badge } from '@/shared/ui'

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const { t } = useTranslation('sales')
  return <Badge tone={status === 'completed' ? 'success' : 'danger'}>{t(`status.${status}`)}</Badge>
}
