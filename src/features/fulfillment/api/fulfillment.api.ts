import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'

export type FulfillmentStatus =
  'pending' | 'packed' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled'

export interface FulfillmentStep {
  id: number
  status: FulfillmentStatus
  status_label: string
  actor: number | null
  actor_name: string | null
  note: string
  at: string
}

export interface FulfillmentItem {
  product_name: string
  quantity: string
  unit: string
}

export interface Fulfillment {
  id: number
  sale: number
  number: string
  branch: number
  branch_name: string
  status: FulfillmentStatus
  status_label: string
  address: string
  contact_phone: string
  note: string
  reject_reason: string
  customer_name: string | null
  total: string
  currency_code: string
  packed_by_name: string | null
  packed_at: string | null
  verified_by_name: string | null
  verified_at: string | null
  courier: number | null
  courier_name: string | null
  accepted_at: string | null
  delivered_at: string | null
  delivered_note: string
  cancelled_at: string | null
  cancel_reason: string
  created_at: string
  updated_at: string
}

export interface FulfillmentDetail extends Fulfillment {
  items: FulfillmentItem[]
  steps: FulfillmentStep[]
}

export type FulfillmentSummary = Record<FulfillmentStatus, number>

type Params = Record<string, string | number | boolean | undefined>

const BASE = '/fulfillment/orders/'

export const fulfillmentApi = {
  list: (params: Params) =>
    api.get<{ count: number; total_pages?: number; results: Fulfillment[] }>(BASE, params),
  detail: (id: number) => api.get<FulfillmentDetail>(`${BASE}${id}/`),
  summary: () => api.get<FulfillmentSummary>(`${BASE}summary/`),
  create: (body: { sale: number; address?: string; contact_phone?: string; note?: string }) =>
    api.post<FulfillmentDetail>(BASE, body),
  act: (id: number, action: string, body: Record<string, string> = {}) =>
    api.post<FulfillmentDetail>(`${BASE}${id}/${action}/`, body),
}

export function useFulfillments(params: Params) {
  return useQuery({
    queryKey: queryKeys.fulfillment.list(params),
    queryFn: () => fulfillmentApi.list(params),
    // jarayon tez o'zgaradi (omborchi → operator → kuryer): ro'yxat o'zi yangilanib turadi
    refetchInterval: 15_000,
  })
}

export function useFulfillment(id: number | null) {
  return useQuery({
    queryKey: queryKeys.fulfillment.detail(id ?? 0),
    queryFn: () => fulfillmentApi.detail(id as number),
    enabled: id !== null,
  })
}

export function useFulfillmentSummary() {
  return useQuery({
    queryKey: queryKeys.fulfillment.summary,
    queryFn: fulfillmentApi.summary,
    refetchInterval: 15_000,
  })
}

export function useFulfillmentAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: number; action: FulfillmentAction; body?: Record<string, string> }) =>
      fulfillmentApi.act(v.id, v.action, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.fulfillment.all }),
  })
}

export function useSendToFulfillment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fulfillmentApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.fulfillment.all }),
  })
}

export type FulfillmentAction = 'pack' | 'verify' | 'reject' | 'accept' | 'deliver' | 'cancel'
