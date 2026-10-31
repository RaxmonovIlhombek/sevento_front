import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Schemas } from '@/shared/api/types'

export type BillOfMaterials = Schemas['BillOfMaterials']
export type ProductionOrder = Schemas['ProductionOrder']

export const manufacturingApi = {
  boms: () => api.get<BillOfMaterials[]>('/manufacturing/boms/'),
  orders: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<{ count: number; results: ProductionOrder[] }>('/manufacturing/orders/', params),
}

export function useBoms() {
  return useQuery({ queryKey: queryKeys.manufacturing.boms, queryFn: manufacturingApi.boms })
}

export function useProductionOrders(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({ queryKey: queryKeys.manufacturing.orders(params), queryFn: () => manufacturingApi.orders(params) })
}
