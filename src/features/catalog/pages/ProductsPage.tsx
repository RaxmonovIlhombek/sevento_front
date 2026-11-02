import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useAuthStore, useCapability } from '@/features/auth'
import type { Product } from '@/shared/api/types'
import { useListParams } from '@/shared/hooks/useListParams'
import {
  ActiveBadge,
  Button,
  DataTable,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  type Column,
} from '@/shared/ui'

import { useCategoryTree, usePriceTypes, useProducts } from '../api/catalog.api'
import { PriceList } from '../components/PriceList'
import { flattenTree, indentLabel } from '../lib/tree'

export function ProductsPage() {
  const { t } = useTranslation('catalog')
  const { t: tc } = useTranslation()
  const navigate = useNavigate()
  const canManage = useCapability('catalog.manage')
  const branchId = useAuthStore((s) => s.currentBranchId)
  const { params, page, set, setPage } = useListParams()
  const tree = useCategoryTree()
  const priceTypes = usePriceTypes()
  const products = useProducts({
    page,
    search: params.search,
    category: params.category,
    is_active: params.is_active ?? 'true',
    branch: branchId ?? undefined,
  })

  const flat = useMemo(() => flattenTree(tree.data ?? []), [tree.data])
  const defaultType = priceTypes.data?.find((p) => p.is_default) ?? priceTypes.data?.[0]

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: t('products.name'),
      render: (p) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{p.name}</span>
            {p.is_fragile && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                {t('products.fragile')}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {p.sku}
            {p.barcode && ` · ${p.barcode}`}
            {p.box_barcode && ` · 📦 ${p.box_barcode}`}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('products.category'),
      render: (p) =>
        p.category_name ?? <span className="text-slate-400">{t('products.noCategory')}</span>,
    },
    {
      key: 'unit',
      header: t('products.packaging'),
      render: (p) => (
        <div className="text-xs">
          <span className="font-medium">
            {p.units_per_box ?? 1} {p.unit_name}
          </span>
          <span className="text-slate-500"> / {p.box_name || 'Karobka'}</span>
        </div>
      ),
    },
    {
      key: 'volume_m3',
      header: 'm³ / kg',
      render: (p) => (
        <div className="text-xs text-slate-600">
          {p.volume_m3 ? `${Number(p.volume_m3).toFixed(4)} m³` : '—'}
          {p.weight_kg ? ` · ${Number(p.weight_kg).toFixed(2)} kg` : ''}
        </div>
      ),
    },
    {
      key: 'price',
      header: defaultType ? `${t('products.price')} (${defaultType.name})` : t('products.price'),
      render: (p) => <PriceList prices={p.prices} priceType={defaultType?.code} />,
    },
    {
      key: 'is_active',
      header: tc('fields.isActive'),
      render: (p) => <ActiveBadge active={p.is_active} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('products.title')}
        actions={
          canManage && (
            <Button
              icon={<Plus className="size-4" />}
              onClick={() => navigate('/catalog/products/new')}
            >
              {t('products.new')}
            </Button>
          )
        }
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <SearchInput
          value={params.search ?? ''}
          onChange={(v) => set({ search: v })}
          placeholder={t('products.searchPlaceholder')}
          className="w-full sm:w-80"
        />
        <Select
          value={params.category ?? ''}
          onChange={(e) => set({ category: e.target.value })}
          className="w-full sm:w-56"
          aria-label={t('products.category')}
        >
          <option value="">{t('products.allCategories')}</option>
          {flat.map((c) => (
            <option key={c.id} value={c.id}>
              {indentLabel(c)}
            </option>
          ))}
        </Select>
        <Select
          value={params.is_active ?? 'true'}
          onChange={(e) => set({ is_active: e.target.value === 'true' ? null : e.target.value })}
          className="w-full sm:w-40"
        >
          <option value="true">{tc('status.active')}</option>
          <option value="false">{tc('status.inactive')}</option>
          <option value="">{tc('table.all')}</option>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={products.data?.results}
        rowKey={(p) => p.id}
        loading={products.isFetching}
        onRowClick={(p) => navigate(`/catalog/products/${p.id}`)}
      />
      <div className="mt-3">
        <Pagination
          page={page}
          totalPages={products.data?.total_pages ?? 1}
          count={products.data?.count ?? 0}
          onChange={setPage}
        />
      </div>
    </div>
  )
}
