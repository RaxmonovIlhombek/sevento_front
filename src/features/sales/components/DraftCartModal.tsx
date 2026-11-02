import { Clock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, ConfirmDialog, Modal, toast } from '@/shared/ui'
import type { Currency } from '@/shared/api/types'

import { deleteDraft, listDrafts, type DraftCart } from '../lib/draft'
import { cartTotals, minorToString } from '../lib/money'

interface Props {
  open: boolean
  onClose: () => void
  onLoad: (draft: DraftCart) => void
  currencies: Currency[]
}

export function DraftCartModal({ open, onClose, onLoad, currencies }: Props) {
  const { t } = useTranslation('sales')
  const [drafts, setDrafts] = useState<DraftCart[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)

  const placesFor = (code: string) => currencies.find((c) => c.code === code)?.decimal_places ?? 2

  const loadDraft = (draft: DraftCart) => {
    setDrafts(listDrafts())
    onLoad(draft)
    onClose()
    toast.success(t('pos.draftLoaded'))
  }

  const handleDelete = (id: string) => {
    setDeleting(id)
    deleteDraft(id)
    setDrafts(listDrafts())
    toast.success(t('pos.draftDeleted'))
    setDeleting(null)
  }

  return (
    <Modal open={open} onClose={onClose} title={t('pos.drafts')} size="lg">
      {!open ? null : (
        <>
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Clock className="size-10 mb-2 opacity-40" />
              <p>{t('pos.draftsEmpty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
              {drafts.map((draft) => {
                const places = placesFor(draft.currency)
                const totals = cartTotals(
                  draft.lines.map((l) => ({
                    quantity: l.quantity,
                    price: l.product.price ?? '0',
                    discount: l.discount || '',
                  })),
                  places,
                )
                return (
                  <div key={draft.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="font-medium truncate">{draft.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {new Date(draft.updatedAt).toLocaleString()} · {draft.currency} ·
                        {draft.lines.length} {t('pos.draftLinesCount')}
                      </div>
                    </div>
                    <div className="text-right tabular-nums text-sm">
                      <div className="font-semibold">
                        {minorToString(totals.total, places)} {draft.currency}
                      </div>
                      <div className="flex items-end gap-1 text-xs">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => loadDraft(draft)}
                          disabled={deleting === draft.id}
                        >
                          {t('pos.load')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(draft.id)}
                          disabled={deleting === draft.id}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <ConfirmDialog
            open={deleting !== null}
            title={t('pos.deleteDraft')}
            text={t('pos.deleteDraftConfirm')}
            confirmLabel={t('actions.delete')}
            onConfirm={() => {}}
            onClose={() => setDeleting(null)}
            loading={deleting !== null}
          />
        </>
      )}
    </Modal>
  )
}
