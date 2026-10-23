/**
 * Barcha TanStack Query kalitlari bir joyda. Realtime invalidate xaritasi (2-bosqich)
 * shu kalitlarga tayanadi.
 */
export const queryKeys = {
  me: ['me'] as const,
  capabilities: ['capabilities'] as const,
  users: {
    all: ['users'] as const,
    list: (params: object) => ['users', 'list', params] as const,
    detail: (id: number | string) => ['users', 'detail', String(id)] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: (params: object = {}) => ['roles', 'list', params] as const,
    detail: (id: number | string) => ['roles', 'detail', String(id)] as const,
  },
  branches: {
    all: ['branches'] as const,
    list: (params: object = {}) => ['branches', 'list', params] as const,
    detail: (id: number | string) => ['branches', 'detail', String(id)] as const,
  },
  settings: {
    all: ['settings'] as const,
  },
  audit: {
    all: ['audit'] as const,
    list: (params: object) => ['audit', 'list', params] as const,
  },
  currency: {
    all: ['currency'] as const,
    currencies: ['currency', 'currencies'] as const,
    latest: ['currency', 'latest'] as const,
    rates: (params: object) => ['currency', 'rates', params] as const,
  },
  catalog: {
    all: ['catalog'] as const,
    categories: ['catalog', 'categories'] as const,
    categoryTree: ['catalog', 'categories', 'tree'] as const,
    units: ['catalog', 'units'] as const,
    priceTypes: ['catalog', 'price-types'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params: object) => ['products', 'list', params] as const,
    detail: (id: number | string, branch?: number | null) =>
      ['products', 'detail', String(id), branch ?? null] as const,
    prices: (id: number | string) => ['products', 'prices', String(id)] as const,
  },
}
