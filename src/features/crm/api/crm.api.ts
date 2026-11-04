import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Paginated, Schemas } from '@/shared/api/types'

export type Lead = Schemas['Lead']
export type Deal = Schemas['Deal']
export type Activity = Schemas['Activity']

export const crmApi = {
  activities: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<Paginated<Activity>>('/crm/activities/', params),
  leads: () => api.get<Paginated<Lead>>('/crm/leads/', { page_size: 100 }).then((r) => r.results),
  deals: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<{ count: number; results: Deal[] }>('/crm/deals/', params),
}

export function useLeads() {
  return useQuery({ queryKey: queryKeys.crm.leads, queryFn: crmApi.leads })
}

export function useDeals(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({ queryKey: queryKeys.crm.deals(params), queryFn: () => crmApi.deals(params) })
}

export function useActivities(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: queryKeys.crm.activities(params),
    queryFn: () => crmApi.activities(params),
  })
}
