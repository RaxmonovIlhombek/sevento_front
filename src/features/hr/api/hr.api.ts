import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Schemas } from '@/shared/api/types'

export type Department = Schemas['Department']
export type Position = Schemas['Position']
export type Employee = Schemas['Employee']

export const hrApi = {
  departments: () => api.get<Department[]>('/hr/departments/'),
  positions: () => api.get<Position[]>('/hr/positions/'),
  employees: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<{ count: number; results: Employee[] }>('/hr/employees/', params),
  createEmployee: (body: unknown) => api.post<Employee>('/hr/employees/', body),
}

export function useDepartments() {
  return useQuery({ queryKey: queryKeys.hr.departments, queryFn: hrApi.departments })
}

export function usePositions() {
  return useQuery({ queryKey: queryKeys.hr.positions, queryFn: hrApi.positions })
}

export function useEmployees(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({ queryKey: queryKeys.hr.employees(params), queryFn: () => hrApi.employees(params) })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: hrApi.createEmployee, onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }) })
}
