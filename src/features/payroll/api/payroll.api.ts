import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Schemas } from '@/shared/api/types'

export type PayrollRun = Schemas['PayrollRun']

export const payrollApi = {
  runs: () => api.get<PayrollRun[]>('/payroll/runs/'),
}

export function usePayrollRuns() {
  return useQuery({ queryKey: queryKeys.payroll.runs, queryFn: payrollApi.runs })
}
