import { useBoms } from '../api/manufacturing.api'

export function BomsPage() {
  const { data, isPending } = useBoms()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">BOM (Materiallar ro‘yxati)</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Nomi</th>
            <th className="border px-2">Mahsulot</th>
            <th className="border px-2">Versiya</th>
            <th className="border px-2">Holat</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((b) => (
            <tr key={b.id}>
              <td className="border px-2">{b.name}</td>
              <td className="border px-2">{b.product_name}</td>
              <td className="border px-2">{b.version}</td>
              <td className="border px-2">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
