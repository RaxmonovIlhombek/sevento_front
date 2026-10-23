import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type {
  CashFlowCategory,
  Cashbox,
  CashTransaction,
  ListParams,
  Paginated,
  PaymentMethod,
  PaymentMethodRequest,
} from '@/shared/api/types'

export const paymentsApi = {
  methods: () => api.get<PaymentMethod[]>('/payments/methods/'),
  createMethod: (body: PaymentMethodRequest) => api.post<PaymentMethod>('/payments/methods/', body),
  updateMethod: (id: number, body: Partial<PaymentMethodRequest>) =>
    api.patch<PaymentMethod>(`/payments/methods/${id}/`, body),
  categories: () => api.get<CashFlowCategory[]>('/payments/cash-categories/'),
  cashboxes: (params: { branch?: number | null }) =>
    api.get<Cashbox[]>('/payments/cashboxes/', { branch: params.branch ?? undefined }),
  transactions: (params: ListParams) =>
    api.get<Paginated<CashTransaction>>('/payments/cash-transactions/', params),
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.payments.methods,
    queryFn: paymentsApi.methods,
    staleTime: 5 * 60_000,
  })
}

export function useSavePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: PaymentMethodRequest }) =>
      id ? paymentsApi.updateMethod(id, body) : paymentsApi.createMethod(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.payments.methods }),
  })
}

export function useCashCategories(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.categories,
    queryFn: paymentsApi.categories,
    staleTime: 10 * 60_000,
    enabled,
  })
}

/** Kassa qoldig'i; to'lov kelganda (payment.received) realtime bilan yangilanadi. */
export function useCashboxes(params: { branch?: number | null }, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.cashboxes(params),
    queryFn: () => paymentsApi.cashboxes(params),
    enabled,
    meta: { pollWhenOffline: true },
  })
}

export function useCashTransactions(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.payments.transactions(params),
    queryFn: () => paymentsApi.transactions(params),
    placeholderData: keepPreviousData,
  })
}
