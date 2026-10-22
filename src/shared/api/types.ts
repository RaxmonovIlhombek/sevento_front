/**
 * API turlari — faqat generatsiya qilingan schema.d.ts dan alias lar.
 * Qo'lda dublikat tur yozilmaydi; o'zgarsa `npm run gen:api`.
 */
import type { components, paths } from './schema'

export type { paths }
export type Schemas = components['schemas']

export type Me = Schemas['Me']
export type MeBranch = Schemas['UserBranch']
export type RoleBrief = Schemas['RoleBrief']
export type LoginRequest = Schemas['LoginRequest']
export type LoginResponse = Schemas['LoginResponse']
export type ChangePasswordRequest = Schemas['ChangePasswordRequest']
export type Capability = Schemas['Capability']

export type User = Schemas['User']
export type UserWriteRequest = Schemas['UserWriteRequest']
export type UserPatchRequest = Schemas['PatchedUserWriteRequest']
export type SetPasswordRequest = Schemas['SetPasswordRequest']

export type Role = Schemas['Role']
export type RoleRequest = Schemas['RoleRequest']
export type RolePatchRequest = Schemas['PatchedRoleRequest']

export type Branch = Schemas['Branch']
export type BranchRequest = Schemas['BranchRequest']
export type BranchPatchRequest = Schemas['PatchedBranchRequest']
export type BranchType = Branch['type']

export type AuditLog = Schemas['AuditLog']
export type SystemSetting = Schemas['SystemSetting']
export type Health = Schemas['Health']

export interface Paginated<T> {
  count: number
  page: number
  page_size: number
  total_pages: number
  results: T[]
}

/** Umumiy ro'yxat parametrlari (core.api.pagination + filter formati). */
export interface ListParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  [key: string]: string | number | boolean | undefined
}
