import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Paginated } from '@/shared/api/types'

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type RequestScope = 'assigned' | 'mine' | ''

export const REQUEST_TYPES = [
  'discount',
  'writeoff',
  'expense',
  'refund',
  'purchase',
  'other',
] as const
export type RequestType = (typeof REQUEST_TYPES)[number]

export interface ApprovalStep {
  id: number
  approver: number
  approver_name: string
  sequence: number
  decision: 'pending' | 'approved' | 'rejected'
  decided_at: string | null
  comment: string
}

export interface ApprovalInstance {
  id: number
  entity_type: string
  type_label: string
  title: string
  status: RequestStatus
  requested_by: number
  requested_by_name: string
  branch: number | null
  branch_name: string | null
  amount: string
  decided_at: string | null
  notes: string
  steps: ApprovalStep[]
  current_approver_name: string | null
  can_decide: boolean
  can_cancel: boolean
  created_at: string
}

export interface ApprovalRule {
  id: number
  entity_type: string
  type_label: string
  min_amount: string
  max_amount: string | null
  branch: number | null
  branch_name: string | null
  approver: number
  approver_name: string
  sequence: number
  is_active: boolean
}

export interface RuleWrite {
  entity_type: string
  min_amount: string
  max_amount: string | null
  branch: number | null
  approver: number
  sequence: number
  is_active: boolean
}

export interface NewRequest {
  entity_type: string
  title: string
  amount: string
  branch: number | null
  notes: string
}

const base = '/workflow'

export function useApprovals(params: { scope: RequestScope; status: string; page: number }) {
  return useQuery({
    queryKey: [...queryKeys.workflow.instances, params],
    queryFn: () =>
      api.get<Paginated<ApprovalInstance>>(`${base}/instances/`, {
        scope: params.scope,
        status: params.status,
        page: params.page,
      }),
    placeholderData: (prev) => prev,
  })
}

export function useApprovalSummary() {
  return useQuery({
    queryKey: queryKeys.workflow.summary,
    queryFn: () =>
      api.get<{ assigned: number; mine_pending: number }>(`${base}/instances/summary/`),
    staleTime: 30_000,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: queryKeys.workflow.all })
}

export function useCreateRequest() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (body: NewRequest) => api.post<ApprovalInstance>(`${base}/instances/`, body),
    onSuccess: invalidate,
  })
}

export function useDecide() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, approve, comment }: { id: number; approve: boolean; comment: string }) =>
      api.post<ApprovalInstance>(`${base}/instances/${id}/${approve ? 'approve' : 'reject'}/`, {
        comment,
      }),
    onSuccess: invalidate,
  })
}

export function useCancelRequest() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: number) => api.post<ApprovalInstance>(`${base}/instances/${id}/cancel/`),
    onSuccess: invalidate,
  })
}

export function useApprovalRules() {
  return useQuery({
    queryKey: queryKeys.workflow.rules,
    queryFn: () => api.get<Paginated<ApprovalRule>>(`${base}/rules/`, { page_size: 200 }),
    select: (page) => page.results,
  })
}

export function useSaveRule() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: RuleWrite }) =>
      id
        ? api.patch<ApprovalRule>(`${base}/rules/${id}/`, body)
        : api.post<ApprovalRule>(`${base}/rules/`, body),
    onSuccess: invalidate,
  })
}

export function useDeleteRule() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: number) => api.delete(`${base}/rules/${id}/`),
    onSuccess: invalidate,
  })
}
