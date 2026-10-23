import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type {
  DailySummary,
  PosConfig,
  ListParams,
  Paginated,
  PosProduct,
  SaleDetail,
  SaleList,
  SaleWriteRequest,
} from '@/shared/api/types'

export interface PosQuery {
  branch: number
  currency: string
  price_type?: number | null
  search?: string
  barcode?: string
  ids?: string
  limit?: number
}

export const salesApi = {
  list: (params: ListParams) => api.get<Paginated<SaleList>>('/sales/', params),
  detail: (id: number | string) => api.get<SaleDetail>(`/sales/${id}/`),
  create: (body: SaleWriteRequest, idempotencyKey: string) =>
    api.post<SaleDetail>('/sales/', body, { idempotencyKey }),
  cancel: (id: number, reason: string) => api.post<SaleDetail>(`/sales/${id}/cancel/`, { reason }),
  receipt: (id: number) => api.blob(`/sales/${id}/receipt/`),
  posConfig: () => api.get<PosConfig>('/sales/pos-config/'),
  pos: (query: PosQuery) =>
    api.get<PosProduct[]>('/sales/pos-products/', {
      ...query,
      price_type: query.price_type ?? undefined,
    }),
  summary: (params: { date?: string; branch?: number | null }) =>
    api.get<DailySummary>('/sales/summary/', {
      date: params.date,
      branch: params.branch ?? undefined,
    }),
}

export function useSales(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.sales.list(params),
    queryFn: () => salesApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useSale(id: number | string | undefined) {
  return useQuery({
    queryKey: queryKeys.sales.detail(id ?? ''),
    queryFn: () => salesApi.detail(id!),
    enabled: id !== undefined,
  })
}

/** Kassa qidiruvi; qoldiq stock.changed bilan jonli yangilanadi (realtime invalidatsiya). */
export function usePosProducts(query: PosQuery | null) {
  return useQuery({
    queryKey: queryKeys.sales.pos(query ?? {}),
    queryFn: () => salesApi.pos(query!),
    enabled: query !== null,
    placeholderData: keepPreviousData,
    meta: { pollWhenOffline: true },
  })
}

export function usePosConfig() {
  return useQuery({
    queryKey: [...queryKeys.sales.all, 'pos-config'],
    queryFn: salesApi.posConfig,
    staleTime: 5 * 60_000,
  })
}

export function useDailySummary(params: { date?: string; branch?: number | null }, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sales.summary(params),
    queryFn: () => salesApi.summary(params),
    enabled,
    meta: { pollWhenOffline: true },
  })
}

function invalidateAfterSale(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.sales.all })
  void qc.invalidateQueries({ queryKey: queryKeys.inventory.all })
  void qc.invalidateQueries({ queryKey: queryKeys.payments.all })
}

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: SaleWriteRequest; idempotencyKey: string }) =>
      salesApi.create(body, idempotencyKey),
    onSuccess: () => invalidateAfterSale(qc),
  })
}

export function useCancelSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => salesApi.cancel(id, reason),
    onSuccess: (sale) => {
      qc.setQueryData(queryKeys.sales.detail(sale.id), sale)
      invalidateAfterSale(qc)
    },
  })
}
