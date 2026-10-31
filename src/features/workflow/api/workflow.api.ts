import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Schemas } from '@/shared/api/types'

export type ApprovalInstance = Schemas['ApprovalInstance']

export const workflowApi = {
  instances: () => api.get<ApprovalInstance[]>('/workflow/instances/'),
  approve: (id: number, comment?: string) => api.post<ApprovalInstance>(`/workflow/instances/${id}/approve/`, { comment }),
  reject: (id: number, comment?: string) => api.post<ApprovalInstance>(`/workflow/instances/${id}/reject/`, { comment }),
}

export function useApprovalInstances() {
  return useQuery({ queryKey: queryKeys.workflow.instances, queryFn: workflowApi.instances })
}
