import { useApprovalInstances } from '../api/workflow.api'

export function ApprovalsPage() {
  const { data, isPending } = useApprovalInstances()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tasdiqlash so‘rovlari</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Turi</th>
            <th className="border px-2">ID</th>
            <th className="border px-2">Holat</th>
            <th className="border px-2">So‘rovchi</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((a) => (
            <tr key={a.id}>
              <td className="border px-2">{a.entity_type}</td>
              <td className="border px-2">{a.entity_id}</td>
              <td className="border px-2">{a.status}</td>
              <td className="border px-2">{a.requested_by_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
