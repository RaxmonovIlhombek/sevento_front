import { useMarkAllRead, useMarkRead, useNotifications } from '../api/notifications.api'

export function NotificationsPage() {
  const { data, isPending } = useNotifications()
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Bildirishnomalar</h1>
        <button className="text-blue-600" onClick={() => markAll.mutate()}>
          Barchasini o‘qilgan deb belgilash
        </button>
      </div>
      {isPending && <p>Yuklanmoqda...</p>}
      <ul className="space-y-2">
        {(data ?? []).map((n) => (
          <li key={n.id} className={`border p-3 rounded ${n.is_read ? 'opacity-60' : 'bg-blue-50'}`}>
            <div className="font-semibold">{n.title}</div>
            <div className="text-sm text-gray-600">{n.message}</div>
            {!n.is_read && (
              <button className="text-blue-600 text-sm mt-1" onClick={() => markRead.mutate(n.id)}>
                O‘qildi
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
