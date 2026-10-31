import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Schemas } from '@/shared/api/types'

export type Notification = Schemas['Notification']

export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications/'),
  read: (id: number) => api.post<Notification>(`/notifications/${id}/read/`),
  readAll: () => api.post<{ updated: number }>('/notifications/read_all/'),
}

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications.list, queryFn: notificationsApi.list })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: notificationsApi.read, onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }) })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: notificationsApi.readAll, onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }) })
}
