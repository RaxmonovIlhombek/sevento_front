import { useCapability } from '@/features/auth'

import { useJournalEntries, usePostEntry, useReverseEntry } from '../api/accounting.api'

export function JournalEntriesPage() {
  const { data, isPending } = useJournalEntries({ page: 1, page_size: 50 })
  const post = usePostEntry()
  const reverse = useReverseEntry()
  const canManage = useCapability('accounting.manage')
  const rows = data?.results ?? []

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Jurnal yozuvlari</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Raqam</th>
            <th className="border px-2">Sana</th>
            <th className="border px-2">Holat</th>
            <th className="border px-2">Amal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="border px-2">{e.number}</td>
              <td className="border px-2">{e.date}</td>
              <td className="border px-2">{e.status}</td>
              <td className="border px-2">
                {canManage && e.status === 'draft' && (
                  <button className="text-blue-600" onClick={() => post.mutate(e.id)}>
                    O'tkazish
                  </button>
                )}
                {canManage && e.status === 'posted' && (
                  <button
                    className="text-red-600"
                    disabled={reverse.isPending}
                    onClick={() => {
                      if (window.confirm(`${e.number} yozuvi bekor qilinsinmi?`))
                        reverse.mutate(e.id)
                    }}
                  >
                    Bekor qilish
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
