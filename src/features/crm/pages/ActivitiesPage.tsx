import { useActivities } from '../api/crm.api'

const typeLabels: Record<string, string> = {
  call: "Qo'ng'iroq",
  email: 'Email',
  meeting: 'Uchrashuv',
  note: 'Eslatma',
  task: 'Vazifa',
}

export function ActivitiesPage() {
  const { data, isPending } = useActivities({ page: 1, page_size: 50 })
  const rows = data?.results ?? []
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">CRM faoliyatlari</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Turi</th>
            <th className="border px-2">Mavzu</th>
            <th className="border px-2">Muddat</th>
            <th className="border px-2">Bajarildi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="border px-2">{typeLabels[a.activity_type ?? 'note']}</td>
              <td className="border px-2">{a.subject}</td>
              <td className="border px-2">
                {a.due_date ? a.due_date.slice(0, 16).replace('T', ' ') : ''}
              </td>
              <td className="border px-2">{a.completed ? 'Ha' : "Yo'q"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
