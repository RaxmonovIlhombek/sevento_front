import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/features/auth'
import { useUsers } from '@/features/settings'
import { ApiError } from '@/shared/api/errors'
import { formatMoney, parseDecimalInput } from '@/shared/lib/money'
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  FormField,
  Input,
  Modal,
  Select,
  Switch,
  toast,
  type Column,
} from '@/shared/ui'

import {
  REQUEST_TYPES,
  useApprovalRules,
  useDeleteRule,
  useSaveRule,
  type ApprovalRule,
} from '../api/workflow.api'

interface Draft {
  id?: number
  entity_type: string
  min_amount: string
  max_amount: string
  branch: string
  approver: string
  sequence: string
  is_active: boolean
}

const emptyDraft: Draft = {
  entity_type: 'expense',
  min_amount: '0',
  max_amount: '',
  branch: '',
  approver: '',
  sequence: '1',
  is_active: true,
}

function RuleModal({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const { t } = useTranslation('workflow')
  const user = useAuthStore((s) => s.user)
  const users = useUsers({ page_size: 100 })
  const save = useSaveRule()
  const [local, setLocal] = useState<Draft | null>(null)
  const [error, setError] = useState('')

  const value = local ?? draft
  if (!draft || !value) return null
  const set = (patch: Partial<Draft>) => setLocal({ ...value, ...patch })
  const close = () => {
    setLocal(null)
    setError('')
    onClose()
  }

  const submit = async () => {
    if (!value.approver) return setError(t('rules.approverRequired'))
    const max = parseDecimalInput(value.max_amount)
    try {
      await save.mutateAsync({
        id: value.id,
        body: {
          entity_type: value.entity_type,
          min_amount: parseDecimalInput(value.min_amount) || '0',
          max_amount: max || null,
          branch: value.branch ? Number(value.branch) : null,
          approver: Number(value.approver),
          sequence: Number(value.sequence) || 1,
          is_active: value.is_active,
        },
      })
      toast.success(t('rules.saved'))
      close()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('new.failed'))
    }
  }

  return (
    <Modal
      open
      onClose={close}
      title={value.id ? t('rules.edit') : t('rules.add')}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {t('cancel')}
          </Button>
          <Button loading={save.isPending} onClick={() => void submit()}>
            {t('save')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <FormField label={t('new.type')}>
          <Select value={value.entity_type} onChange={(e) => set({ entity_type: e.target.value })}>
            {REQUEST_TYPES.map((code) => (
              <option key={code} value={code}>
                {t(`types.${code}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label={`${t('rules.from')} (${t('currency')})`}>
            <Input
              inputMode="decimal"
              value={value.min_amount}
              onChange={(e) => set({ min_amount: e.target.value })}
            />
          </FormField>
          <FormField label={`${t('rules.to')} (${t('currency')})`} hint={t('rules.toHint')}>
            <Input
              inputMode="decimal"
              value={value.max_amount}
              onChange={(e) => set({ max_amount: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label={t('rules.approver')} required>
          <Select value={value.approver} onChange={(e) => set({ approver: e.target.value })}>
            <option value="">—</option>
            {users.data?.results
              .filter((u) => u.is_active)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                  {u.role_detail?.name ? ` (${u.role_detail.name})` : ''}
                </option>
              ))}
          </Select>
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label={t('rules.sequence')} hint={t('rules.sequenceHint')}>
            <Input
              inputMode="numeric"
              value={value.sequence}
              onChange={(e) => set({ sequence: e.target.value.replace(/\D/g, '') })}
            />
          </FormField>
          <FormField label={t('new.branch')} hint={t('rules.branchHint')}>
            <Select value={value.branch} onChange={(e) => set({ branch: e.target.value })}>
              <option value="">{t('rules.allBranches')}</option>
              {user?.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <Switch
          checked={value.is_active}
          onChange={(v) => set({ is_active: v })}
          label={t('rules.active')}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  )
}

/** Qoidalar: qaysi turdagi va qaysi summadagi so'rovni kim, qaysi tartibda tasdiqlaydi. */
export function RulesTab() {
  const { t } = useTranslation('workflow')
  const rules = useApprovalRules()
  const del = useDeleteRule()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [toDelete, setToDelete] = useState<ApprovalRule | null>(null)

  const range = (r: ApprovalRule) =>
    r.max_amount
      ? `${formatMoney(r.min_amount, undefined, 0)} – ${formatMoney(r.max_amount, undefined, 0)}`
      : t('rules.orMore', { from: formatMoney(r.min_amount, undefined, 0) })

  const columns: Column<ApprovalRule>[] = [
    {
      key: 'type',
      header: t('new.type'),
      render: (r) => <Badge tone="info">{r.type_label}</Badge>,
    },
    { key: 'range', header: t('rules.amountRange'), render: range },
    { key: 'approver', header: t('rules.approver'), render: (r) => r.approver_name },
    {
      key: 'sequence',
      header: t('rules.sequence'),
      className: 'text-center tabular-nums',
      render: (r) => r.sequence,
    },
    {
      key: 'branch',
      header: t('new.branch'),
      render: (r) => r.branch_name ?? t('rules.allBranches'),
    },
    {
      key: 'active',
      header: '',
      render: (r) => (r.is_active ? null : <Badge tone="neutral">{t('rules.off')}</Badge>),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('rules.edit')}
            icon={<Pencil className="size-4" />}
            onClick={() =>
              setDraft({
                id: r.id,
                entity_type: r.entity_type,
                min_amount: String(Number(r.min_amount)),
                max_amount: r.max_amount ? String(Number(r.max_amount)) : '',
                branch: r.branch ? String(r.branch) : '',
                approver: String(r.approver),
                sequence: String(r.sequence),
                is_active: r.is_active,
              })
            }
          />
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('rules.delete')}
            icon={<Trash2 className="size-4 text-red-600" />}
            onClick={() => setToDelete(r)}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">{t('rules.help')}</p>
        <Button icon={<Plus className="size-4" />} onClick={() => setDraft(emptyDraft)}>
          {t('rules.add')}
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={rules.data}
        rowKey={(r) => r.id}
        loading={rules.isPending}
        emptyText={t('rules.empty')}
      />
      <RuleModal draft={draft} onClose={() => setDraft(null)} />
      <ConfirmDialog
        open={toDelete !== null}
        text={t('rules.deleteConfirm')}
        loading={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return
          try {
            await del.mutateAsync(toDelete.id)
            toast.success(t('rules.deleted'))
          } catch {
            toast.error(t('new.failed'))
          } finally {
            setToDelete(null)
          }
        }}
      />
    </div>
  )
}
