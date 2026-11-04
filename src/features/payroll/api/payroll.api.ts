import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Paginated, Schemas } from '@/shared/api/types'

export type PayrollRun = Schemas['PayrollRun']

export const payrollApi = {
  runs: () =>
    api.get<Paginated<PayrollRun>>('/payroll/runs/', { page_size: 100 }).then((r) => r.results),
  calculate: (id: number) => api.post<PayrollRun>(`/payroll/runs/${id}/calculate/`, {}),
  pay: (id: number) => api.post<PayrollRun>(`/payroll/runs/${id}/pay/`, {}),
}

export function usePayrollRuns() {
  return useQuery({ queryKey: queryKeys.payroll.runs, queryFn: payrollApi.runs })
}

export function useCalculatePayroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: payrollApi.calculate,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.payroll.all }),
  })
}

export function usePayPayroll() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: payrollApi.pay,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.payroll.all }),
  })
}
