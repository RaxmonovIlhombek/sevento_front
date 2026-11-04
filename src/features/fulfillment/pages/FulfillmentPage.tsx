import { MapPin, Package, Phone, RefreshCw } from 'lucide-react'
import { useState } from 'react'

import { useAuthStore } from '@/features/auth'
import { errorMessage } from '@/shared/api/errors'
import { useListParams } from '@/shared/hooks/useListParams'
import { formatDateTime } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'
import { formatMoney } from '@/shared/lib/money'
import {
  Badge,
  Button,
  EmptyState,
  FormField,
  Modal,
  PageHeader,
  PageSpinner,
  SearchInput,
  Textarea,
  toast,
} from '@/shared/ui'

import {
  useFulfillment,
  useFulfillmentAction,
  useFulfillments,
  useFulfillmentSummary,
  type Fulfillment,
  type FulfillmentStatus,
} from '../api/fulfillment.api'
import {
  availableActions,
  defaultTab,
  STATUS_LABEL,
  STATUS_TONE,
  type ActionSpec,
} from '../lib/actions'

const TABS: (FulfillmentStatus | 'all')[] = [
  'all',
  'pending',
  'packed',
  'ready',
  'on_the_way',
  'delivered',
  'cancelled',
]
const TAB_LABEL: Record<FulfillmentStatus | 'all', string> = { all: 'Hammasi', ...STATUS_LABEL }

export function FulfillmentPage() {
  const capabilities = useAuthStore((s) => s.user?.capabilities ?? [])
  const { params, set } = useListParams()
  const tab = (params.status as FulfillmentStatus | 'all' | undefined) ?? defaultTab(capabilities)
  const [openId, setOpenId] = useState<number | null>(null)

  const list = useFulfillments({
    status: tab === 'all' ? undefined : tab,
    search: params.search || undefined,
    page_size: 50,
  })
  const summary = useFulfillmentSummary()
  const rows = list.data?.results ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <PageHeader
        title="Buyurtmalar jarayoni"
        subtitle="Omborchi taxlaydi → operator tekshiradi → kuryer yetkazadi"
        actions={
          <Button
            variant="ghost"
            icon={<RefreshCw className={cn('size-4', list.isFetching && 'animate-spin')} />}
            onClick={() => void list.refetch()}
            aria-label="Yangilash"
          />
        }
      />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist">
        {TABS.map((key) => {
          const count =
            key === 'all'
              ? summary.data
                ? Object.values(summary.data).reduce((a, b) => a + b, 0)
                : undefined
              : summary.data?.[key]
          const active = tab === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => set({ status: key })}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700',
              )}
            >
              {TAB_LABEL[key]}
              {count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-xs',
                    active ? 'bg-white/20' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <SearchInput
        value={params.search ?? ''}
        onChange={(v) => set({ search: v })}
        placeholder="Raqam, mijoz, manzil yoki telefon"
        className="w-full"
      />

      {list.isPending ? (
        <PageSpinner />
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white py-10">
          <EmptyState text="Bu bosqichda buyurtma yo'q" />
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((o) => (
            <OrderCard key={o.id} order={o} onOpen={() => setOpenId(o.id)} />
          ))}
        </ul>
      )}

      <OrderModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}

function OrderCard({ order, onOpen }: { order: Fulfillment; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm active:bg-slate-50"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold">{order.number}</span>
          <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-700">{order.customer_name ?? 'Mijozsiz savdo'}</p>
        {order.address && (
          <p className="mt-1 flex items-start gap-1 text-sm text-slate-500">
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            {order.address}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {order.branch_name} · {formatDateTime(order.created_at)}
          </span>
          <span className="font-medium text-slate-700">
            {formatMoney(order.total, order.currency_code, 0)}
          </span>
        </div>
        {order.courier_name && (
          <p className="mt-1 text-xs text-slate-500">Kuryer: {order.courier_name}</p>
        )}
        {order.status === 'pending' && order.reject_reason && (
          <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
            Operator qaytardi: {order.reject_reason}
          </p>
        )}
      </button>
    </li>
  )
}

function OrderModal({ id, onClose }: { id: number | null; onClose: () => void }) {
  const detail = useFulfillment(id)
  const act = useFulfillmentAction()
  const user = useAuthStore((s) => s.user)
  const [pending, setPending] = useState<ActionSpec | null>(null)
  const [text, setText] = useState('')
  const o = detail.data

  const close = () => {
    setPending(null)
    setText('')
    onClose()
  }

  const run = (spec: ActionSpec, body: Record<string, string> = {}) => {
    if (!o) return
    act.mutate(
      { id: o.id, action: spec.action, body },
      {
        onSuccess: () => {
          toast.success(`${o.number}: ${spec.label.toLowerCase()}`)
          setPending(null)
          setText('')
          if (['verify', 'deliver', 'cancel', 'accept'].includes(spec.action)) onClose()
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  const onAction = (spec: ActionSpec) => {
    if (spec.reason) {
      setPending(spec)
      return
    }
    run(spec)
  }

  const actions = o ? availableActions(o, user?.capabilities ?? [], user?.id ?? null) : []
  const needsReason = pending?.reason === 'required'

  return (
    <Modal
      open={id !== null}
      onClose={close}
      title={o ? `Buyurtma ${o.number}` : 'Buyurtma'}
      footer={
        pending ? (
          <>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Ortga
            </Button>
            <Button
              variant={pending.variant === 'danger' ? 'danger' : 'primary'}
              loading={act.isPending}
              disabled={needsReason && !text.trim()}
              onClick={() =>
                run(
                  pending,
                  pending.action === 'reject' || pending.action === 'cancel'
                    ? { reason: text.trim() }
                    : { note: text.trim() },
                )
              }
            >
              {pending.label}
            </Button>
          </>
        ) : (
          actions.map((a) => (
            <Button
              key={a.action}
              variant={a.variant}
              loading={act.isPending}
              onClick={() => onAction(a)}
            >
              {a.label}
            </Button>
          ))
        )
      }
    >
      {!o ? (
        <PageSpinner />
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
            <span className="font-medium">{formatMoney(o.total, o.currency_code, 0)}</span>
          </div>

          <div className="space-y-1">
            <p className="font-medium">{o.customer_name ?? 'Mijozsiz savdo'}</p>
            {o.address && (
              <p className="flex items-start gap-1 text-slate-600">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                {o.address}
              </p>
            )}
            {o.contact_phone && (
              <a
                href={`tel:${o.contact_phone}`}
                className="flex items-center gap-1 text-brand-700 underline"
              >
                <Phone className="size-4" />
                {o.contact_phone}
              </a>
            )}
            {o.note && <p className="text-slate-500">Izoh: {o.note}</p>}
          </div>

          <section>
            <h3 className="mb-1 flex items-center gap-1 font-medium">
              <Package className="size-4" /> Tovarlar
            </h3>
            <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between px-3 py-1.5">
                  <span>{it.product_name}</span>
                  <span className="text-slate-600">
                    {Number(it.quantity)} {it.unit}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-1 font-medium">Jarayon tarixi</h3>
            <ol className="space-y-1.5 border-l-2 border-slate-200 pl-3">
              {o.steps.map((s) => (
                <li key={s.id}>
                  <p className="font-medium">{STATUS_LABEL[s.status]}</p>
                  <p className="text-xs text-slate-500">
                    {s.actor_name ?? '—'} · {formatDateTime(s.at)}
                  </p>
                  {s.note && <p className="text-xs text-slate-600">{s.note}</p>}
                </li>
              ))}
            </ol>
          </section>

          {pending && (
            <FormField
              label={needsReason ? 'Sabab (majburiy)' : 'Izoh (ixtiyoriy)'}
              required={needsReason}
            >
              <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
            </FormField>
          )}
        </div>
      )}
    </Modal>
  )
}
