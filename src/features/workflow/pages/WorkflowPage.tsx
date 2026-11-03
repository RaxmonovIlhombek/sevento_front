import { ClipboardCheck, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/features/auth'
import { ApiError } from '@/shared/api/errors'
import { cn } from '@/shared/lib/cn'
import { Button, PageHeader, PageSpinner, Pagination, Select, toast } from '@/shared/ui'

import {
  useApprovals,
  useApprovalSummary,
  useCancelRequest,
  type ApprovalInstance,
  type RequestScope,
} from '../api/workflow.api'
import { DecisionModal, type DecisionTarget } from '../components/DecisionModal'
import { NewRequestModal } from '../components/NewRequestModal'
import { RequestCard } from '../components/RequestCard'
import { RulesTab } from '../components/RulesTab'

type Tab = 'assigned' | 'mine' | 'all' | 'rules'

const scopeOf: Record<Exclude<Tab, 'rules'>, RequestScope> = {
  assigned: 'assigned',
  mine: 'mine',
  all: '',
}

/** Jarayonlar: tasdiqlash so'rovlari — menga kelganlar, o'zim yuborganlar, hammasi va qoidalar. */
export function WorkflowPage() {
  const { t } = useTranslation('workflow')
  const canManage = useAuthStore((s) => s.user?.capabilities.includes('workflow.manage') ?? false)
  const summary = useApprovalSummary()
  const [tab, setTab] = useState<Tab>('assigned')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [newOpen, setNewOpen] = useState(false)
  const [decision, setDecision] = useState<DecisionTarget | null>(null)
  const cancel = useCancelRequest()

  const list = useApprovals({
    scope: tab === 'rules' ? '' : scopeOf[tab],
    status: tab === 'assigned' ? 'pending' : status,
    page,
  })

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'assigned', label: t('tabs.assigned'), count: summary.data?.assigned },
    { key: 'mine', label: t('tabs.mine'), count: summary.data?.mine_pending },
    ...(canManage
      ? ([
          { key: 'all', label: t('tabs.all') },
          { key: 'rules', label: t('tabs.rules') },
        ] as const)
      : []),
  ]

  const onCancel = async (item: ApprovalInstance) => {
    try {
      await cancel.mutateAsync(item.id)
      toast.success(t('cancelled'))
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('new.failed'))
    }
  }

  const items = list.data?.results ?? []

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setNewOpen(true)}>
            {t('new.title')}
          </Button>
        }
      />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key)
              setPage(1)
              setStatus('')
            }}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap',
              tab === key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {label}
            {count ? (
              <span className="rounded-full bg-sky-500 px-1.5 text-xs font-semibold text-white">
                {count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'rules' ? (
        <RulesTab />
      ) : (
        <>
          {tab !== 'assigned' && (
            <div className="mb-3 w-48">
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                aria-label={t('filter.status')}
              >
                <option value="">{t('filter.all')}</option>
                {(['pending', 'approved', 'rejected', 'cancelled'] as const).map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}`)}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {list.isPending ? (
            <PageSpinner />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <ClipboardCheck className="size-10 text-slate-300" />
              <p className="font-medium text-slate-700">{t(`empty.${tab}.title`)}</p>
              <p className="max-w-md text-sm text-slate-500">{t(`empty.${tab}.text`)}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <RequestCard
                  key={item.id}
                  item={item}
                  onApprove={(i) => setDecision({ item: i, approve: true })}
                  onReject={(i) => setDecision({ item: i, approve: false })}
                  onCancel={(i) => void onCancel(i)}
                />
              ))}
              <Pagination
                page={page}
                totalPages={list.data?.total_pages ?? 1}
                count={list.data?.count ?? 0}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}

      <NewRequestModal open={newOpen} onClose={() => setNewOpen(false)} />
      <DecisionModal target={decision} onClose={() => setDecision(null)} />
    </div>
  )
}
