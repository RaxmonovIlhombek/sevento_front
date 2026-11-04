import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Paginated, Schemas } from '@/shared/api/types'

export type Department = Schemas['Department']
export type Position = Schemas['Position']
export type Employee = Schemas['Employee']

export interface HireOptions {
  roles: { id: number; code: string; name: string }[]
  branches: { id: number; code: string; name: string }[]
  departments: { id: number; name: string }[]
  positions: { id: number; name: string; department: number }[]
}

export interface HireBody {
  full_name: string
  username: string
  password: string
  phone?: string
  role: number
  branch: number
  department: number
  position: number
  base_salary?: string
}

export interface DepartmentBody {
  name: string
  parent?: number | null
  branch?: number | null
  is_active?: boolean
}

export interface PositionBody {
  name: string
  department: number
  is_active?: boolean
}

export const hrApi = {
  departments: () =>
    api.get<Paginated<Department>>('/hr/departments/', { page_size: 100 }).then((r) => r.results),
  positions: () =>
    api.get<Paginated<Position>>('/hr/positions/', { page_size: 100 }).then((r) => r.results),
  createDepartment: (body: DepartmentBody) => api.post<Department>('/hr/departments/', body),
  updateDepartment: (id: number, body: DepartmentBody) =>
    api.patch<Department>(`/hr/departments/${id}/`, body),
  deleteDepartment: (id: number) => api.delete(`/hr/departments/${id}/`),
  createPosition: (body: PositionBody) => api.post<Position>('/hr/positions/', body),
  updatePosition: (id: number, body: PositionBody) =>
    api.patch<Position>(`/hr/positions/${id}/`, body),
  deletePosition: (id: number) => api.delete(`/hr/positions/${id}/`),
  employees: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<{ count: number; results: Employee[] }>('/hr/employees/', params),
  createEmployee: (body: unknown) => api.post<Employee>('/hr/employees/', body),
  hireOptions: () => api.get<HireOptions>('/hr/employees/hire-options/'),
  hire: (body: HireBody) => api.post<Employee>('/hr/employees/hire/', body),
  terminate: (id: number) => api.post<Employee>(`/hr/employees/${id}/terminate/`, {}),
}

export function useDepartments() {
  return useQuery({ queryKey: queryKeys.hr.departments, queryFn: hrApi.departments })
}

export function usePositions() {
  return useQuery({ queryKey: queryKeys.hr.positions, queryFn: hrApi.positions })
}

export function useEmployees(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: queryKeys.hr.employees(params),
    queryFn: () => hrApi.employees(params),
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hrApi.createEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useHireOptions(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.hr.all, 'hire-options'],
    queryFn: hrApi.hireOptions,
    enabled,
  })
}

export function useHireEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hrApi.hire,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useTerminateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hrApi.terminate,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hrApi.createDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: DepartmentBody }) =>
      hrApi.updateDepartment(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hrApi.deleteDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useCreatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hrApi.createPosition,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useUpdatePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: PositionBody }) =>
      hrApi.updatePosition(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}

export function useDeletePosition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hrApi.deletePosition,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hr.all }),
  })
}
