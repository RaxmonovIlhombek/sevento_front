import { useDeals } from '../api/crm.api'

export function DealsPage() {
  const { data, isPending } = useDeals({ page: 1, page_size: 50 })
  const rows = data?.results ?? []
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Bitimlar (Deal)</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Nomi</th>
            <th className="border px-2">Bosqich</th>
            <th className="border px-2">Summa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id}>
              <td className="border px-2">{d.name}</td>
              <td className="border px-2">{d.stage}</td>
              <td className="border px-2">{d.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
