import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import type { ListParams, Paginated } from '@/shared/api/types'

export const securityApi = {
  status: () => api.get<{ enabled: boolean }>('/security/2fa/status/'),
  setup: () =>
    api.post<{ id: number; is_verified: boolean; secret: string; provisioning_uri: string }>(
      '/security/2fa/setup/',
    ),
  verify: (code: string) => api.post<{ enabled: boolean }>('/security/2fa/verify/', { code }),
  disable: (code: string) => api.post<{ enabled: boolean }>('/security/2fa/disable/', { code }),
}

export function use2FAStatus() {
  return useQuery({ queryKey: ['security', '2fa', 'status'], queryFn: securityApi.status })
}

export interface LoginEvent {
  id: number
  user: number | null
  username: string
  user_full_name: string | null
  role_name: string | null
  success: boolean
  reason: string
  ip: string
  browser: string
  os: string
  device_type: string
  created_at: string
}

export interface UserLoginSummary {
  id: number
  username: string
  full_name: string
  role_name: string | null
  is_active: boolean
  last_login: string | null
  last_ip: string
  last_browser: string
  last_os: string
  last_device_type: string
  logins_30d: number
  failed_30d: number
}

export const loginHistoryApi = {
  list: (params: ListParams) => api.get<Paginated<LoginEvent>>('/security/logins/', params),
  summary: () => api.get<UserLoginSummary[]>('/security/logins/summary/'),
}

export function useLoginEvents(params: ListParams) {
  return useQuery({
    queryKey: ['security', 'logins', 'list', params],
    queryFn: () => loginHistoryApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useLoginSummary() {
  return useQuery({
    queryKey: ['security', 'logins', 'summary'],
    queryFn: loginHistoryApi.summary,
  })
}
