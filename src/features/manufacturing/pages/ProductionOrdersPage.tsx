import { useProductionOrders } from '../api/manufacturing.api'

export function ProductionOrdersPage() {
  const { data, isPending } = useProductionOrders({ page: 1, page_size: 50 })
  const rows = data?.results ?? []
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ishlab chiqarish buyurtmalari</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Raqam</th>
            <th className="border px-2">Mahsulot</th>
            <th className="border px-2">Miqdor</th>
            <th className="border px-2">Holat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td className="border px-2">{o.number}</td>
              <td className="border px-2">{o.product_name}</td>
              <td className="border px-2">{o.quantity}</td>
              <td className="border px-2">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
