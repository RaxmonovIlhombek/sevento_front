import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

import { formatDateTime } from '@/shared/lib/date'
import { Button, Card, EmptyState, PageHeader } from '@/shared/ui'

import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  type Notification,
} from '../api/notifications.api'

const typeIcons: Record<Notification['notification_type'], ReactNode> = {
  info: <Info className="size-5 text-sky-600" />,
  success: <CheckCircle2 className="size-5 text-emerald-600" />,
  warning: <AlertTriangle className="size-5 text-amber-600" />,
  error: <XCircle className="size-5 text-red-600" />,
}

export function NotificationsPage() {
  const { data, isPending } = useNotifications()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const navigate = useNavigate()
  const notifications = data ?? []
  const unreadCount = notifications.filter((n) => !n.is_read).length

  const openNotification = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bildirishnomalar"
        actions={
          unreadCount > 0 && (
            <Button
              variant="secondary"
              loading={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              Barchasini o‘qilgan deb belgilash
            </Button>
          )
        }
      />

      {!isPending && notifications.length === 0 ? (
        <EmptyState text="Hozircha bildirishnoma yo'q" />
      ) : (
        <Card>
          <div className="-m-5 divide-y divide-slate-100 overflow-hidden rounded-lg">
            {isPending &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-slate-50" />
              ))}
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => openNotification(n)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                  n.is_read ? 'opacity-60' : 'bg-brand-50/40'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {typeIcons[n.notification_type] ?? <Info className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium text-slate-900">{n.title}</span>
                    {!n.is_read && <span className="size-2 shrink-0 rounded-full bg-brand-600" />}
                  </span>
                  {n.message && (
                    <span className="mt-0.5 block text-sm text-slate-600">{n.message}</span>
                  )}
                  <span className="mt-1 block text-xs text-slate-400">
                    {formatDateTime(n.created_at)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
