import { errorMessage } from '@/shared/api/errors'
import { openPdf, printPdf } from '@/shared/lib/print'
import { toast } from '@/shared/ui'

import { salesApi } from '../api/sales.api'

/** Chek PDF ni Authorization bilan oladi va chop etadi (yoki yangi oynada ochadi). */
export async function printReceipt(saleId: number, mode: 'print' | 'open' = 'print') {
  try {
    const blob = await salesApi.receipt(saleId)
    if (mode === 'print') printPdf(blob)
    else openPdf(blob)
  } catch (error) {
    toast.error(errorMessage(error))
  }
}
