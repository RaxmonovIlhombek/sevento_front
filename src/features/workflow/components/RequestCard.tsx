import { Check, CircleDot, Clock, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { formatDateTime } from '@/shared/lib/date'
import { cn } from '@/shared/lib/cn'
import { formatMoney } from '@/shared/lib/money'
import { Badge, Button } from '@/shared/ui'

import type { ApprovalInstance, ApprovalStep, RequestStatus } from '../api/workflow.api'

const statusTone = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
} as const satisfies Record<RequestStatus, string>

const stripe: Record<RequestStatus, string> = {
  pending: 'bg-amber-400',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-slate-300',
}

function StepChip({ step, current }: { step: ApprovalStep; current: boolean }) {
  const { t } = useTranslation('workflow')
  const icon =
    step.decision === 'approved' ? (
      <Check className="size-3.5" />
    ) : step.decision === 'rejected' ? (
      <X className="size-3.5" />
    ) : current ? (
      <CircleDot className="size-3.5" />
    ) : (
      <Clock className="size-3.5" />
    )
  return (
    <li className="min-w-0">
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
          step.decision === 'approved' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
          step.decision === 'rejected' && 'border-red-200 bg-red-50 text-red-800',
          step.decision === 'pending' &&
            (current
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-slate-200 bg-slate-50 text-slate-500'),
        )}
        title={step.decided_at ? formatDateTime(step.decided_at) : t(`step.${step.decision}`)}
      >
        {icon}
        <span className="truncate">{step.approver_name}</span>
      </div>
      {step.comment && (
        <p className="mt-0.5 pl-3 text-xs text-slate-500 italic">“{step.comment}”</p>
      )}
    </li>
  )
}

export interface RequestCardProps {
  item: ApprovalInstance
  onApprove: (item: ApprovalInstance) => void
  onReject: (item: ApprovalInstance) => void
  onCancel: (item: ApprovalInstance) => void
}

/** Bitta so'rov: nima, kim yuborgan, qancha, kimda navbat va qaror tugmalari. */
export function RequestCard({ item, onApprove, onReject, onCancel }: RequestCardProps) {
  const { t } = useTranslation('workflow')
  const currentId =
    item.status === 'pending' ? item.steps.find((s) => s.decision === 'pending')?.id : null

  return (
    <article className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={cn('w-1.5 shrink-0', stripe[item.status])} />
      <div className="min-w-0 flex-1 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-900">
              {item.title || item.type_label}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              <Badge tone="info">{item.type_label}</Badge>
              {item.branch_name && <span className="ml-2">{item.branch_name}</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-slate-900">
              {formatMoney(item.amount, undefined, 0)}{' '}
              <span className="text-xs font-medium text-slate-500">{t('currency')}</span>
            </p>
            <Badge tone={statusTone[item.status]}>{t(`status.${item.status}`)}</Badge>
          </div>
        </div>

        {item.notes && (
          <p className="mt-2 text-sm whitespace-pre-line text-slate-600">{item.notes}</p>
        )}

        {item.steps.length > 0 && (
          <ol className="mt-3 flex flex-wrap items-start gap-2">
            {item.steps.map((s) => (
              <StepChip key={s.id} step={s} current={s.id === currentId} />
            ))}
          </ol>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            {item.requested_by_name} · {formatDateTime(item.created_at)}
            {item.status === 'pending' && item.current_approver_name && (
              <> · {t('waitingFor', { name: item.current_approver_name })}</>
            )}
          </p>
          <div className="flex gap-2">
            {item.can_decide && (
              <>
                <Button
                  size="sm"
                  icon={<Check className="size-4" />}
                  onClick={() => onApprove(item)}
                >
                  {t('approve')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<X className="size-4" />}
                  onClick={() => onReject(item)}
                >
                  {t('reject')}
                </Button>
              </>
            )}
            {item.can_cancel && !item.can_decide && (
              <Button size="sm" variant="secondary" onClick={() => onCancel(item)}>
                {t('cancelRequest')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
