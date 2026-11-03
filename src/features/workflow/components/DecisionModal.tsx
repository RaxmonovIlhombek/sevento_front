import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ApiError } from '@/shared/api/errors'
import { Button, FormField, Modal, Textarea, toast } from '@/shared/ui'

import { useDecide, type ApprovalInstance } from '../api/workflow.api'

export interface DecisionTarget {
  item: ApprovalInstance
  approve: boolean
}

/** Tasdiqlash yoki rad etish: izoh bilan. Rad etishda sababni yozish majburiy. */
export function DecisionModal({
  target,
  onClose,
}: {
  target: DecisionTarget | null
  onClose: () => void
}) {
  const { t } = useTranslation('workflow')
  const decide = useDecide()
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  if (!target) return null
  const { item, approve } = target

  const close = () => {
    setComment('')
    setError('')
    onClose()
  }

  const submit = async () => {
    if (!approve && !comment.trim()) return setError(t('decision.reasonRequired'))
    try {
      await decide.mutateAsync({ id: item.id, approve, comment: comment.trim() })
      toast.success(approve ? t('decision.approved') : t('decision.rejected'))
      close()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('new.failed'))
    }
  }

  return (
    <Modal
      open
      onClose={close}
      title={approve ? t('decision.approveTitle') : t('decision.rejectTitle')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {t('cancel')}
          </Button>
          <Button
            variant={approve ? 'primary' : 'danger'}
            loading={decide.isPending}
            onClick={() => void submit()}
          >
            {approve ? t('approve') : t('reject')}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-600">{item.title || item.type_label}</p>
      <FormField
        label={approve ? t('decision.commentOptional') : t('decision.reason')}
        required={!approve}
      >
        <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
      </FormField>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Modal>
  )
}
