import { useTrialBalance } from '../api/accounting.api'

interface TrialBalanceRow {
  account?: string | number
  name?: string
  debit?: string | number
  credit?: string | number
  balance?: string | number
}

export function TrialBalancePage() {
  const { data, isPending } = useTrialBalance({})
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Trial balance</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Hisob</th>
            <th className="border px-2">Nomi</th>
            <th className="border px-2">Debet</th>
            <th className="border px-2">Kredit</th>
            <th className="border px-2">Balans</th>
          </tr>
        </thead>
        <tbody>
          {(data as TrialBalanceRow[] ?? []).map((r, i) => (
            <tr key={i}>
              <td className="border px-2">{r.account}</td>
              <td className="border px-2">{r.name}</td>
              <td className="border px-2">{r.debit}</td>
              <td className="border px-2">{r.credit}</td>
              <td className="border px-2">{r.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
