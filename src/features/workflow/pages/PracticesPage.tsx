import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, ConfirmDialog, DataTable, PageHeader, toast, type Column } from '@/shared/ui'

import type { ApprovalInstance } from '../api/workflow.api'
import { useApprovalInstances, workflowApi } from '../api/workflow.api'

/** Amaliy jarayonlar (workflow/SOP) ro‘yxati. Har bir jarayonni tasdiqlash yoki rad etish mumkin. */
export function PracticesPage() {
  const { t } = useTranslation('sales')
  const { data, isPending } = useApprovalInstances()
  const instances: ApprovalInstance[] = data ?? []

  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [mode, setMode] = useState<'approve' | 'reject'>('approve')

  const columns: Column<ApprovalInstance>[] = [
    {
      key: 'entity_type',
      header: t('practices.type'),
      render: (a) => <span className="font-medium">{a.entity_type}</span>,
    },
    {
      key: 'entity_id',
      header: 'ID',
      className: 'text-right tabular-nums',
      render: (a) => a.entity_id,
    },
    {
      key: 'status',
      header: t('practices.status'),
      render: (a) => (
        <span
          className={`text-xs font-medium ${
            a.status === 'approved'
              ? 'text-green-600'
              : a.status === 'rejected'
                ? 'text-red-600'
                : 'text-amber-600'
          }`}
        >
          {a.status}
        </span>
      ),
    },
    {
      key: 'requested_by_name',
      header: t('practices.requestedBy'),
      render: (a) => <span>{a.requested_by_name}</span>,
    },
    {
      key: 'action',
      header: '',
      className: 'text-right gap-2',
      render: (a) => {
        if (a.status !== 'pending') return <span className="text-slate-400">—</span>
        return (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setMode('approve')
                setConfirmId(a.id)
              }}
            >
              {t('practices.approve')}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setMode('reject')
                setConfirmId(a.id)
              }}
            >
              {t('practices.reject')}
            </Button>
          </div>
        )
      },
    },
  ]

  const handleConfirm = async () => {
    if (!confirmId) return
    try {
      if (mode === 'approve') await workflowApi.approve(confirmId)
      else await workflowApi.reject(confirmId)
      toast.success(mode === 'approve' ? t('practices.approved') : t('practices.rejected'))
    } catch {
      toast.error(t('practices.error'))
    } finally {
      setConfirmId(null)
    }
  }

  return (
    <div>
      <PageHeader title={t('practices.title')} />
      <DataTable
        columns={columns}
        rows={instances}
        rowKey={(a) => a.id}
        loading={isPending}
        emptyText={t('practices.empty')}
      />
      <ConfirmDialog
        open={confirmId !== null}
        title={mode === 'approve' ? t('practices.approve') : t('practices.reject')}
        text={t('practices.confirm')}
        confirmLabel={mode === 'approve' ? t('practices.approve') : t('practices.reject')}
        onConfirm={handleConfirm}
        onClose={() => setConfirmId(null)}
        loading={confirmId !== null}
      />
      <Check className="fixed bottom-4 right-4 text-green-600 opacity-0" />
      <X className="fixed bottom-4 right-12 text-red-600 opacity-0" />
    </div>
  )
}
