import { useFiscalYears } from '../api/accounting.api'

export function FiscalYearsPage() {
  const { data, isPending } = useFiscalYears()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Moliyaviy yillar</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Yil</th>
            <th className="border px-2">Boshlanishi</th>
            <th className="border px-2">Tugashi</th>
            <th className="border px-2">Holat</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((y) => (
            <tr key={y.id}>
              <td className="border px-2">{y.year}</td>
              <td className="border px-2">{y.start_date}</td>
              <td className="border px-2">{y.end_date}</td>
              <td className="border px-2">{y.is_closed ? 'Yopilgan' : 'Ochiq'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
