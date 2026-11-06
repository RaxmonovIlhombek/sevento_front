import { Truck } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/shared/ui'

import { useFulfillments } from '../api/fulfillment.api'
import { STATUS_LABEL, STATUS_TONE } from '../lib/actions'

/** Har bir savdo endi avtomatik omborchiga yuboriladi — shu yerda uning holati ko'rsatiladi. */
export function FulfillmentStatusLink({
  saleId,
  saleNumber,
}: {
  saleId: number
  saleNumber: string
}) {
  const { data, isPending } = useFulfillments({ sale: saleId })
  const fulfillment = data?.results[0]

  if (isPending || !fulfillment) return null

  return (
    <Link
      to={`/fulfillment?search=${encodeURIComponent(saleNumber)}`}
      className="inline-flex"
      data-testid="sale-fulfillment-status"
    >
      <Badge tone={STATUS_TONE[fulfillment.status]}>
        <Truck className="mr-1 size-3.5" />
        {STATUS_LABEL[fulfillment.status]}
      </Badge>
    </Link>
  )
}
