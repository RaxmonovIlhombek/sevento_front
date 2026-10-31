import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'

export const securityApi = {
  status: () => api.get<{ enabled: boolean }>('/security/2fa/status/'),
  setup: () =>
    api.post<{ id: number; is_verified: boolean; secret: string; provisioning_uri: string }>('/security/2fa/setup/'),
  verify: (code: string) => api.post<{ enabled: boolean }>('/security/2fa/verify/', { code }),
  disable: (code: string) => api.post<{ enabled: boolean }>('/security/2fa/disable/', { code }),
}

export function use2FAStatus() {
  return useQuery({ queryKey: ['security', '2fa', 'status'], queryFn: securityApi.status })
}
