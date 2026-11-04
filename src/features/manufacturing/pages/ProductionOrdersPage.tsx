import { useCapability } from '@/features/auth'

import { useCompleteOrder, useProductionOrders, useReleaseOrder } from '../api/manufacturing.api'

export function ProductionOrdersPage() {
  const { data, isPending } = useProductionOrders({ page: 1, page_size: 50 })
  const rows = data?.results ?? []
  const release = useReleaseOrder()
  const complete = useCompleteOrder()
  const canManage = useCapability('manufacturing.manage')
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
            <th className="border px-2">Amal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td className="border px-2">{o.number}</td>
              <td className="border px-2">{o.product_name}</td>
              <td className="border px-2">{o.quantity}</td>
              <td className="border px-2">{o.status}</td>
              <td className="border px-2">
                {canManage && o.status === 'draft' && (
                  <button
                    className="text-blue-600"
                    disabled={release.isPending}
                    onClick={() => release.mutate(o.id)}
                  >
                    Ishga tushirish
                  </button>
                )}
                {canManage && (o.status === 'released' || o.status === 'in_progress') && (
                  <button
                    className="text-green-700"
                    disabled={complete.isPending}
                    onClick={() => complete.mutate(o.id)}
                  >
                    Yakunlash
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
