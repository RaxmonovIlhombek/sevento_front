import { useCapability } from '@/features/auth'

import { useCalculatePayroll, usePayPayroll, usePayrollRuns } from '../api/payroll.api'

export function PayrollRunsPage() {
  const { data, isPending } = usePayrollRuns()
  const calculate = useCalculatePayroll()
  const pay = usePayPayroll()
  const canManage = useCapability('payroll.manage')
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ish haqi (Payroll)</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Davr</th>
            <th className="border px-2">Filial</th>
            <th className="border px-2">Holat</th>
            <th className="border px-2">Jami (gross)</th>
            <th className="border px-2">Jami (net)</th>
            <th className="border px-2">Amal</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((r) => (
            <tr key={r.id}>
              <td className="border px-2">
                {r.period_start} — {r.period_end}
              </td>
              <td className="border px-2">{r.branch_name}</td>
              <td className="border px-2">{r.status}</td>
              <td className="border px-2">{r.total_gross}</td>
              <td className="border px-2">{r.total_net}</td>
              <td className="border px-2">
                {canManage && r.status === 'draft' && (
                  <button
                    className="text-blue-600"
                    disabled={calculate.isPending}
                    onClick={() => calculate.mutate(r.id)}
                  >
                    Hisoblash
                  </button>
                )}
                {canManage && r.status === 'calculated' && (
                  <button
                    className="text-green-700"
                    disabled={pay.isPending}
                    onClick={() => pay.mutate(r.id)}
                  >
                    To'lash
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
