import { useEmployees } from '../api/hr.api'

export function EmployeesPage() {
  const { data, isPending } = useEmployees({ page: 1, page_size: 50 })
  const rows = data?.results ?? []
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Xodimlar</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Raqam</th>
            <th className="border px-2">Foydalanuvchi</th>
            <th className="border px-2">Bo‘lim</th>
            <th className="border px-2">Lavozim</th>
            <th className="border px-2">Holat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id}>
              <td className="border px-2">{e.employee_number}</td>
              <td className="border px-2">{e.user_username}</td>
              <td className="border px-2">{e.department_name}</td>
              <td className="border px-2">{e.position_name}</td>
              <td className="border px-2">{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
