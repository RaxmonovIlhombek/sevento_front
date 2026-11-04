import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCapability } from '@/features/auth'
import { useActiveCurrencies } from '@/features/currency'
import { useAllBranches } from '@/features/settings'
import type { CustomerDetail } from '@/shared/api/types'
import { applyServerErrors } from '@/shared/forms/serverErrors'
import { z } from '@/shared/forms/zod'
import { parseDecimalInput, toDecimalInput } from '@/shared/lib/money'
import { Button, FormField, Input, Modal, PhoneInput, Select, Textarea, toast } from '@/shared/ui'

import { useSaveCustomer } from '../api/payments.api'

const optionalNumber = z
  .string()
  .trim()
  .refine((v) => v === '' || Number.isFinite(Number(parseDecimalInput(v))), { message: 'number' })

const schema = z.object({
  name: z.string().trim().min(2).max(150),
  phone: z.string().trim().max(30),
  tin: z.string().trim().max(20),
  address: z.string().trim().max(255),
  note: z.string(),
  credit_limit_base: optionalNumber,
  default_due_days: optionalNumber,
  primary_branch: z.string(),
  channel: z.string(),
  contact_person: z.string().trim().max(150),
  promise_pay_date: z.string(),
  promise_amount: optionalNumber,
})
type FormValues = z.infer<typeof schema>

interface Props {
  customer?: CustomerDetail
  open: boolean
  onClose: () => void
  onSaved?: (customer: CustomerDetail) => void
}

/** Mijoz qo'shish/tahrirlash. Kredit limiti, baza biriktirish, kanal va to'lov va'dasi. */
export function CustomerFormModal({ customer, open, onClose, onSaved }: Props) {
  const { t } = useTranslation('payments')
  const { t: tc } = useTranslation()
  const canLimit = useCapability('customers.credit_limit.manage')
  const { base } = useActiveCurrencies()
  const branches = useAllBranches()
  const save = useSaveCustomer()

  const { register, control, handleSubmit, setError, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: open
      ? {
          name: customer?.name ?? '',
          phone: customer?.phone ?? '',
          tin: customer?.tin ?? '',
          address: customer?.address ?? '',
          note: customer?.note ?? '',
          credit_limit_base: toDecimalInput(customer?.credit_limit_base),
          default_due_days:
            customer?.default_due_days === null || customer?.default_due_days === undefined
              ? ''
              : String(customer.default_due_days),
          primary_branch: customer?.primary_branch ? String(customer.primary_branch) : '',
          channel: customer?.channel ?? 'retail',
          contact_person: customer?.contact_person ?? '',
          promise_pay_date: customer?.promise_pay_date ?? '',
          promise_amount: toDecimalInput(customer?.promise_amount),
        }
      : undefined,
  })

  const onSubmit = (values: FormValues) => {
    const body: Record<string, unknown> = {
      name: values.name,
      phone: values.phone,
      tin: values.tin,
      address: values.address,
      note: values.note,
      primary_branch: values.primary_branch ? Number(values.primary_branch) : null,
      channel: values.channel || 'retail',
      contact_person: values.contact_person,
      promise_pay_date: values.promise_pay_date || null,
      promise_amount: values.promise_amount ? parseDecimalInput(values.promise_amount) : null,
    }
    if (canLimit) {
      body.credit_limit_base = values.credit_limit_base
        ? parseDecimalInput(values.credit_limit_base)
        : null
      body.default_due_days = values.default_due_days ? Number(values.default_due_days) : null
    }
    save.mutate(
      { id: customer?.id, body },
      {
        onSuccess: (saved) => {
          toast.success(t('customers.saved'))
          onSaved?.(saved)
          onClose()
        },
        onError: (error) => applyServerErrors(error, setError, Object.keys(schema.shape)),
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? t('customers.edit') : t('customers.new')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tc('actions.cancel')}
          </Button>
          <Button
            type="submit"
            form="customer-form"
            loading={save.isPending}
            data-testid="customer-save"
          >
            {tc('actions.save')}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label={t('customers.name')} required error={formState.errors.name?.message}>
          <Input autoFocus {...register('name')} invalid={!!formState.errors.name} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('customers.phone')} error={formState.errors.phone?.message}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!formState.errors.phone}
                />
              )}
            />
          </FormField>
          <FormField label={t('customers.tin')} error={formState.errors.tin?.message}>
            <Input {...register('tin')} inputMode="numeric" />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('customers.primaryBranch')}>
            <Select {...register('primary_branch')}>
              <option value="">{t('customers.allBranches')}</option>
              {branches.data?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t('customers.channel')}>
            <Select {...register('channel')}>
              <option value="retail">{t('customers.channels.retail')}</option>
              <option value="market">{t('customers.channels.market')}</option>
              <option value="wholesale">{t('customers.channels.wholesale')}</option>
              <option value="horeca">{t('customers.channels.horeca')}</option>
              <option value="other">{t('customers.channels.other')}</option>
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('customers.contactPerson')}>
            <Input {...register('contact_person')} placeholder="Do'kondor / mas'ul shaxs" />
          </FormField>
          <FormField label={t('customers.address')}>
            <Input {...register('address')} />
          </FormField>
        </div>

        {canLimit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t('customers.creditLimit', { base })}
              hint={t('customers.creditLimitHint')}
              error={formState.errors.credit_limit_base?.message}
            >
              <Input
                {...register('credit_limit_base')}
                inputMode="decimal"
                data-testid="customer-limit"
              />
            </FormField>
            <FormField
              label={t('customers.dueDays')}
              hint={t('customers.dueDaysHint')}
              error={formState.errors.default_due_days?.message}
            >
              <Input {...register('default_due_days')} inputMode="numeric" />
            </FormField>
          </div>
        )}

        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            {t('customers.promisePayDate')}
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t('customers.promisePayDate')}>
              <Input type="date" {...register('promise_pay_date')} />
            </FormField>
            <FormField label={t('customers.promiseAmount')}>
              <Input {...register('promise_amount')} inputMode="decimal" placeholder="0.00" />
            </FormField>
          </div>
        </div>

        <FormField label={t('customers.note')}>
          <Textarea rows={2} {...register('note')} />
        </FormField>
      </form>
    </Modal>
  )
}
