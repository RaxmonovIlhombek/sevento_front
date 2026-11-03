import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/features/auth'
import { ApiError } from '@/shared/api/errors'
import { parseDecimalInput } from '@/shared/lib/money'
import { Button, FormField, Input, Modal, Select, Textarea, toast } from '@/shared/ui'

import { REQUEST_TYPES, useCreateRequest } from '../api/workflow.api'

/** Yangi tasdiqlash so'rovi: tur, nima uchun, qancha. Tasdiqlovchilar qoidalardan avtomatik topiladi. */
export function NewRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation('workflow')
  const user = useAuthStore((s) => s.user)
  const currentBranchId = useAuthStore((s) => s.currentBranchId)
  const create = useCreateRequest()

  const [type, setType] = useState<string>(REQUEST_TYPES[2])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [branch, setBranch] = useState<string>(currentBranchId ? String(currentBranchId) : '')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const reset = () => {
    setTitle('')
    setAmount('')
    setNotes('')
    setError('')
  }

  const submit = async () => {
    if (!title.trim()) return setError(t('new.titleRequired'))
    const value = parseDecimalInput(amount)
    if (!value || Number.isNaN(Number(value)) || Number(value) < 0)
      return setError(t('new.amountInvalid'))
    setError('')
    try {
      await create.mutateAsync({
        entity_type: type,
        title: title.trim(),
        amount: value,
        branch: branch ? Number(branch) : null,
        notes: notes.trim(),
      })
      toast.success(t('new.sent'))
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('new.failed'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('new.title')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button loading={create.isPending} onClick={() => void submit()}>
            {t('new.submit')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">{t('new.help')}</p>
        <FormField label={t('new.type')} required>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {REQUEST_TYPES.map((code) => (
              <option key={code} value={code}>
                {t(`types.${code}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label={t('new.what')} required>
          <Input
            value={title}
            maxLength={200}
            placeholder={t('new.whatPlaceholder')}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label={`${t('new.amount')} (${t('currency')})`} required>
            <Input
              inputMode="decimal"
              value={amount}
              placeholder="0"
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormField>
          <FormField label={t('new.branch')}>
            <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">—</option>
              {user?.branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label={t('new.notes')}>
          <Textarea
            rows={3}
            value={notes}
            maxLength={2000}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  )
}
