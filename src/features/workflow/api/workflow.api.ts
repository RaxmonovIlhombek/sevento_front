import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Paginated, Schemas } from '@/shared/api/types'

export type ApprovalInstance = Schemas['ApprovalInstance']

export const workflowApi = {
  // Backend ro'yxatni sahifalab qaytaradi ({count, results}) — massiv emas.
  instances: () => api.get<Paginated<ApprovalInstance>>('/workflow/instances/', { page_size: 100 }),
  approve: (id: number, comment?: string) =>
    api.post<ApprovalInstance>(`/workflow/instances/${id}/approve/`, { comment }),
  reject: (id: number, comment?: string) =>
    api.post<ApprovalInstance>(`/workflow/instances/${id}/reject/`, { comment }),
}

export function useApprovalInstances() {
  return useQuery({
    queryKey: queryKeys.workflow.instances,
    queryFn: workflowApi.instances,
    select: (page) => page.results,
  })
}

/** Tasdiqlash/rad etishdan keyin ro'yxat yangilanadi. */
export function useDecideApproval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, approve }: { id: number; approve: boolean }) =>
      approve ? workflowApi.approve(id) : workflowApi.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workflow.all }),
  })
}
