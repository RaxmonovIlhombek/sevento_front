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
}
