import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Schemas } from '@/shared/api/types'

export type Account = Schemas['Account']
export type AccountRequest = Schemas['AccountRequest']
export type FiscalPeriod = Schemas['FiscalPeriod']
export type JournalEntry = Schemas['JournalEntry']
export type JournalLine = Schemas['JournalLine']

export const accountingApi = {
  accounts: () => api.get<Account[]>('/accounting/accounts/'),
  createAccount: (body: AccountRequest) => api.post<Account>('/accounting/accounts/', body),
  fiscalPeriods: () => api.get<FiscalPeriod[]>('/accounting/fiscal-periods/'),
  journalEntries: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<{ count: number; results: JournalEntry[] }>('/accounting/journal-entries/', params),
  createJournalEntry: (body: unknown) => api.post<JournalEntry>('/accounting/journal-entries/', body),
  postEntry: (id: number) => api.post<JournalEntry>(`/accounting/journal-entries/${id}/post/`),
  trialBalance: (params: Record<string, string | number | boolean | undefined>) =>
    api.get<unknown[]>('/accounting/journal-entries/trial_balance/', params),
}

export function useAccounts() {
  return useQuery({ queryKey: queryKeys.accounting.accounts, queryFn: accountingApi.accounts })
}

export function useFiscalPeriods() {
  return useQuery({ queryKey: queryKeys.accounting.fiscalPeriods, queryFn: accountingApi.fiscalPeriods })
}

export function useJournalEntries(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: queryKeys.accounting.journalEntries(params),
    queryFn: () => accountingApi.journalEntries(params),
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accountingApi.createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.accounting.all }),
  })
}

export function useCreateJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accountingApi.createJournalEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.accounting.all }),
  })
}

export function usePostEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: accountingApi.postEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.accounting.all }),
  })
}

export function useTrialBalance(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: queryKeys.accounting.trialBalance(params),
    queryFn: () => accountingApi.trialBalance(params),
  })
}
