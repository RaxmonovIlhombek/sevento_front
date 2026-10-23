import { ArrowLeft, Ban, Printer } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { errorMessage } from '@/shared/api/errors'
import type { SaleItem, SalePayment } from '@/shared/api/types'
import { formatDateTime } from '@/shared/lib/date'
import { formatNumber } from '@/shared/lib/money'
import {
  Badge,
  Button,
  Card,
  DataTable,
  FormField,
  Input,
  Modal,
  PageHeader,
  PageSpinner,
  toast,
  type Column,
} from '@/shared/ui'

import { useCancelSale, useSale } from '../api/sales.api'
import { SaleStatusBadge } from '../components/SaleStatusBadge'
import { printReceipt } from '../lib/receipt'

export function SaleDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation('sales')
  const { t: tc } = useTranslation()
  const navigate = useNavigate()
  const sale = useSale(id)
  const cancel = useCancelSale()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')

  if (sale.isPending) return <PageSpinner />
  if (!sale.data) return null
  const s = sale.data
  const places = s.currency_decimal_places
  const showCost = s.cost_base !== null
  const base = s.base_currency

  const itemColumns: Column<SaleItem>[] = [
    { key: 'pos', header: '#', className: 'w-8 text-slate-400', render: (i) => i.position + 1 },
    {
      key: 'product',
      header: t('pos.product'),
      render: (i) => (
        <div>
          <div className="font-medium">{i.product_name}</div>
          <div className="text-xs text-slate-500">{i.product_sku}</div>
        </div>
      ),
    },
    {
      key: 'qty',
      header: t('pos.quantity'),
      className: 'text-right tabular-nums whitespace-nowrap',
      render: (i) => `${formatNumber(i.quantity, i.unit_decimal_places)} ${i.unit_code}`,
    },
    {
      key: 'price',
      header: t('pos.price'),
      className: 'text-right tabular-nums',
      render: (i) => formatNumber(i.unit_price, places),
    },
    {
      key: 'discount',
      header: t('pos.discount'),
      className: 'text-right tabular-nums',
      render: (i) => (Number(i.discount_amount) ? formatNumber(i.discount_amount, places) : '—'),
    },
    {
      key: 'total',
      header: t('pos.lineTotal'),
      className: 'text-right tabular-nums font-semibold',
      render: (i) => formatNumber(i.line_total, places),
    },
    ...(showCost
      ? [
          {
            key: 'cost',
            header: t('detail.cost', { base }),
            className: 'text-right tabular-nums text-slate-500',
            render: (i: SaleItem) => formatNumber(i.cost_base, 2),
          },
        ]
      : []),
  ]

  const paymentColumns: Column<SalePayment>[] = [
    {
      key: 'kind',
      header: t('payment.method'),
      render: (p) => (
        <div className="flex items-center gap-2">
          <span>{p.method_name}</span>
          {p.kind !== 'payment' && (
            <Badge tone={p.direction === 'out' ? 'warning' : 'info'}>
              {t(`detail.kind.${p.kind}`, { defaultValue: p.kind })}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: t('payment.amount'),
      className: 'text-right tabular-nums whitespace-nowrap',
      render: (p) =>
        `${p.direction === 'out' ? '−' : ''}${formatNumber(p.amount, p.currency_decimal_places)} ${p.currency_code}`,
    },
    { key: 'number', header: '№', className: 'text-xs text-slate-500', render: (p) => p.number },
    {
      key: 'at',
      header: t('list.date'),
      className: 'whitespace-nowrap text-slate-500',
      render: (p) => formatDateTime(p.received_at),
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title={s.number}
        subtitle={`${formatDateTime(s.completed_at)} · ${s.branch_name} · ${s.seller_name}`}
        actions={
          <>
            <SaleStatusBadge status={s.status} />
            <Button
              variant="secondary"
              icon={<Printer className="size-4" />}
              onClick={() => void printReceipt(s.id)}
              data-testid="sale-print"
            >
              {t('detail.print')}
            </Button>
            {s.can_cancel && (
              <Button
                variant="secondary"
                icon={<Ban className="size-4" />}
                onClick={() => setCancelOpen(true)}
                data-testid="sale-cancel"
              >
                {t('detail.cancel')}
              </Button>
            )}
            <Button
              variant="ghost"
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate(-1)}
            >
              {tc('actions.back')}
            </Button>
          </>
        }
      />

      {s.status === 'cancelled' && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {t('detail.cancelledBy', {
            name: s.cancelled_by_name ?? '—',
            date: formatDateTime(s.cancelled_at),
          })}
          {s.cancel_reason && ` — ${s.cancel_reason}`}
        </p>
      )}

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">{t('detail.items')}</h2>
        <DataTable columns={itemColumns} rows={s.items} rowKey={(i) => i.id} />
        <dl className="mt-3 ml-auto grid max-w-sm grid-cols-2 gap-y-1 text-sm">
          {Number(s.discount_total) > 0 && (
            <>
              <dt className="text-slate-600">{t('pos.subtotal')}</dt>
              <dd className="text-right tabular-nums">{formatNumber(s.subtotal, places)}</dd>
              <dt className="text-slate-600">{t('pos.discountTotal')}</dt>
              <dd className="text-right tabular-nums">−{formatNumber(s.discount_total, places)}</dd>
            </>
          )}
          <dt className="text-base font-semibold">{t('pos.total')}</dt>
          <dd className="text-right text-base font-bold tabular-nums" data-testid="sale-total">
            {formatNumber(s.total, places)} {s.currency_code}
          </dd>
          {s.currency_code !== base && (
            <>
              <dt className="text-slate-500">{t('detail.totalBase', { base })}</dt>
              <dd className="text-right text-slate-500 tabular-nums">
                {formatNumber(s.total_base, 2)}
              </dd>
            </>
          )}
          {showCost && (
            <>
              <dt className="text-slate-500">{t('detail.cost', { base })}</dt>
              <dd className="text-right text-slate-500 tabular-nums">
                {formatNumber(s.cost_base, 2)}
              </dd>
              <dt className="font-medium text-emerald-700">{t('detail.profit', { base })}</dt>
              <dd className="text-right font-medium text-emerald-700 tabular-nums">
                {formatNumber(s.profit_base, 2)}
              </dd>
            </>
          )}
        </dl>
        <p className="mt-2 text-xs text-slate-400">
          {t('detail.priceType')}: {s.price_type_name}
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">{t('detail.payments')}</h2>
        <DataTable columns={paymentColumns} rows={s.payments} rowKey={(p) => p.id} />
      </Card>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t('detail.cancelTitle')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>
              {tc('actions.close')}
            </Button>
            <Button
              variant="danger"
              loading={cancel.isPending}
              disabled={!reason.trim()}
              onClick={() =>
                cancel.mutate(
                  { id: s.id, reason: reason.trim() },
                  {
                    onSuccess: () => {
                      toast.success(t('detail.cancelled'))
                      setCancelOpen(false)
                    },
                    onError: (error) => toast.error(errorMessage(error)),
                  },
                )
              }
              data-testid="sale-cancel-confirm"
            >
              {t('detail.cancel')}
            </Button>
          </>
        }
      >
        <FormField label={t('detail.cancelReason')} required hint={t('detail.cancelHint')}>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        </FormField>
      </Modal>
    </div>
  )
}
