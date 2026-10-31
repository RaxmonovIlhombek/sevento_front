import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Schemas } from '@/shared/api/types'

export type Lead = Schemas['Lead']
export type Deal = Schemas['Deal']

export const crmApi = {
  leads: () => api.get<Lead[]>('/crm/leads/'),
  deals: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<{ count: number; results: Deal[] }>('/crm/deals/', params),
}

export function useLeads() {
  return useQuery({ queryKey: queryKeys.crm.leads, queryFn: crmApi.leads })
}

export function useDeals(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({ queryKey: queryKeys.crm.deals(params), queryFn: () => crmApi.deals(params) })
}
