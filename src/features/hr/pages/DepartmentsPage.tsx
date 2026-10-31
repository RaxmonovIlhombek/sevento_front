import { useDepartments } from '../api/hr.api'

export function DepartmentsPage() {
  const { data, isPending } = useDepartments()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Bo‘limlar</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <ul className="list-disc pl-6">
        {(data ?? []).map((d) => (
          <li key={d.id}>{d.name}</li>
        ))}
      </ul>
    </div>
  )
}
