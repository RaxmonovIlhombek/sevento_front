import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Button, DataTable, FormField, Input, PageHeader, type Column } from '@/shared/ui'

import type { PosProduct } from '@/shared/api/types'
import { usePosProducts } from '../api/sales.api'
import { useCartStore } from '../store/cart'

/** Katalogdan tayyor (sotuvga qulay) mahsulotlar ro‘yxati. Savatga tezdan qo‘shish uchun. */
export function ReadyProductsPage() {
  const { t } = useTranslation('sales')
  const branchId = useAuthStore((s) => s.currentBranchId)
  const addToCart = useCartStore((s) => s.add)

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search.trim(), 250)
  const enabled = branchId !== null

  const products = usePosProducts(
    enabled
      ? {
          branch: branchId!,
          currency: 'UZS',
          price_type: null,
          search: debounced,
          limit: 50,
        }
      : null,
  )
  const rows: PosProduct[] = products.data ?? []

  const columns: Column<PosProduct>[] = [
    {
      key: 'name',
      header: t('catalog.product'),
      render: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (p) => <span className="text-sm text-slate-500">{p.sku}</span>,
    },
    {
      key: 'barcode',
      header: t('pos.stock'),
      render: (p) => <span className="text-sm text-slate-500">{p.barcode ?? '—'}</span>,
    },
    {
      key: 'stock',
      header: t('pos.qtyAvailable'),
      className: 'text-right tabular-nums',
      render: (p) => {
        const stock = Number(p.stock)
        return (
          <span
            className={cn(
              'text-sm font-medium',
              stock > 0 ? 'text-slate-600' : 'font-semibold text-red-600',
            )}
          >
            {stock > 0 ? `${stock.toFixed(3)} ${p.unit_code}` : t('pos.outOfStock')}
          </span>
        )
      },
    },
    {
      key: 'price',
      header: t('pos.price'),
      className: 'text-right tabular-nums',
      render: (p) =>
        p.price === null ? (
          <span className="text-sm text-slate-400">{t('pos.noPrice')}</span>
        ) : (
          <span>{`${p.price} UZS`}</span>
        ),
    },
    {
      key: 'action',
      header: '',
      className: 'text-right',
      render: (p) => (
        <Button
          size="sm"
          disabled={p.price === null || Number(p.stock) <= 0}
          onClick={() => addToCart(p)}
        >
          {t('readyProducts.add')}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title={t('readyProducts.title')} />
      <div className="mb-3 flex flex-col sm:flex-row gap-2 items-end">
        <FormField label={t('readyProducts.searchPlaceholder')} className="flex-1 min-w-0">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('readyProducts.searchPlaceholder')}
            className="min-w-0"
          />
        </FormField>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        loading={products.isFetching}
        emptyText={t('readyProducts.empty')}
      />
    </div>
  )
}
