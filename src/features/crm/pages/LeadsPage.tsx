import { useLeads } from '../api/crm.api'

export function LeadsPage() {
  const { data, isPending } = useLeads()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Leadlar</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Ism</th>
            <th className="border px-2">Kompaniya</th>
            <th className="border px-2">Status</th>
            <th className="border px-2">Telefon</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((l) => (
            <tr key={l.id}>
              <td className="border px-2">{l.name}</td>
              <td className="border px-2">{l.company}</td>
              <td className="border px-2">{l.status}</td>
              <td className="border px-2">{l.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
