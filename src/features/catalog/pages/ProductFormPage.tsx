import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Box, Boxes, ShieldAlert, Warehouse } from 'lucide-react'
import { useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { useAuthStore, useCapability } from '@/features/auth'
import type { Product } from '@/shared/api/types'
import { applyServerErrors } from '@/shared/forms/serverErrors'
import { z } from '@/shared/forms/zod'
import { parseDecimalInput } from '@/shared/lib/money'
import {
  Button,
  Card,
  FormField,
  Input,
  PageHeader,
  PageSpinner,
  Select,
  Switch,
  Textarea,
  toast,
} from '@/shared/ui'

import { useCategoryTree, useProduct, useSaveProduct, useUnits } from '../api/catalog.api'
import { ProductPrices } from '../components/ProductPrices'
import { flattenTree, indentLabel } from '../lib/tree'

const schema = z.object({
  sku: z.string().trim().min(1).max(50),
  barcode: z.string().trim().max(64),
  name: z.string().trim().min(1).max(200),
  category: z.string(),
  unit: z.string().min(1),
  min_quantity: z
    .string()
    .trim()
    .refine((v) => v === '' || Number(parseDecimalInput(v)) >= 0, { message: 'positive' }),
  description: z.string(),
  is_active: z.boolean(),

  // Xostavar / Qadoqlash
  box_barcode: z.string().trim().max(64),
  units_per_box: z
    .string()
    .trim()
    .refine((v) => v === '' || Number(v) >= 1, { message: 'positive' }),
  box_name: z.string().trim().max(50),
  allow_split_box: z.boolean(),

  // O'lchamlar & Kubatura
  length_cm: z
    .string()
    .trim()
    .refine((v) => v === '' || Number(parseDecimalInput(v)) >= 0, { message: 'positive' }),
  width_cm: z
    .string()
    .trim()
    .refine((v) => v === '' || Number(parseDecimalInput(v)) >= 0, { message: 'positive' }),
  height_cm: z
    .string()
    .trim()
    .refine((v) => v === '' || Number(parseDecimalInput(v)) >= 0, { message: 'positive' }),
  weight_kg: z
    .string()
    .trim()
    .refine((v) => v === '' || Number(parseDecimalInput(v)) >= 0, { message: 'positive' }),
  is_fragile: z.boolean(),
})
type FormValues = z.infer<typeof schema>
const FIELDS = Object.keys(schema.shape)

function toFormValues(product?: Product, defaultUnit?: number): FormValues {
  return {
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? '',
    name: product?.name ?? '',
    category: product?.category ? String(product.category) : '',
    unit: product ? String(product.unit) : defaultUnit ? String(defaultUnit) : '',
    min_quantity: product?.min_quantity ?? '',
    description: product?.description ?? '',
    is_active: product?.is_active ?? true,

    box_barcode: product?.box_barcode ?? '',
    units_per_box: product?.units_per_box ? String(product.units_per_box) : '1',
    box_name: product?.box_name ?? 'Karobka',
    allow_split_box: product?.allow_split_box ?? true,

    length_cm: product?.length_cm ?? '',
    width_cm: product?.width_cm ?? '',
    height_cm: product?.height_cm ?? '',
    weight_kg: product?.weight_kg ?? '',
    is_fragile: product?.is_fragile ?? false,
  }
}

/** /new → /:id ga o'tganda forma yangidan yaratiladi (aks holda eski kiritilgan qiymatlar qoladi). */
export function ProductFormPage() {
  const { id } = useParams()
  return <ProductForm key={id ?? 'new'} id={id} />
}

function ProductForm({ id }: { id?: string }) {
  const isNew = id === undefined
  const { t } = useTranslation('catalog')
  const { t: tc } = useTranslation()
  const navigate = useNavigate()
  const canManage = useCapability('catalog.manage')
  const canViewStock = useCapability('inventory.view')
  const branchId = useAuthStore((s) => s.currentBranchId)

  const product = useProduct(isNew ? undefined : id, branchId)
  const units = useUnits()
  const tree = useCategoryTree()
  const save = useSaveProduct()
  const flat = useMemo(() => flattenTree(tree.data ?? []), [tree.data])
  const defaultUnit = units.data?.find((u) => u.is_active !== false)?.id

  const { register, handleSubmit, control, setError, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: isNew
      ? toFormValues(undefined, defaultUnit)
      : product.data
        ? toFormValues(product.data)
        : undefined,
    resetOptions: { keepDirtyValues: true },
  })

  const [lengthInput, widthInput, heightInput] = useWatch({
    control,
    name: ['length_cm', 'width_cm', 'height_cm'],
  })

  const lengthVal = Number(parseDecimalInput(lengthInput || '0'))
  const widthVal = Number(parseDecimalInput(widthInput || '0'))
  const heightVal = Number(parseDecimalInput(heightInput || '0'))
  const calculatedM3 = useMemo(() => {
    if (lengthVal > 0 && widthVal > 0 && heightVal > 0) {
      return ((lengthVal * widthVal * heightVal) / 1000000).toFixed(4)
    }
    return null
  }, [lengthVal, widthVal, heightVal])

  const onSubmit = (values: FormValues) => {
    const body = {
      sku: values.sku,
      barcode: values.barcode,
      name: values.name,
      category: values.category ? Number(values.category) : null,
      unit: Number(values.unit),
      min_quantity: values.min_quantity ? parseDecimalInput(values.min_quantity) : null,
      description: values.description,
      is_active: values.is_active,

      box_barcode: values.box_barcode || '',
      units_per_box: values.units_per_box ? Number(values.units_per_box) : 1,
      box_name: values.box_name || 'Karobka',
      allow_split_box: values.allow_split_box,

      length_cm: values.length_cm ? parseDecimalInput(values.length_cm) : null,
      width_cm: values.width_cm ? parseDecimalInput(values.width_cm) : null,
      height_cm: values.height_cm ? parseDecimalInput(values.height_cm) : null,
      weight_kg: values.weight_kg ? parseDecimalInput(values.weight_kg) : null,
      is_fragile: values.is_fragile,
    }
    save.mutate(
      { id, body },
      {
        onSuccess: (saved) => {
          toast.success(isNew ? t('products.created') : t('products.updated'))
          if (isNew) navigate(`/catalog/products/${saved.id}`, { replace: true })
        },
        onError: (error) => applyServerErrors(error, setError, FIELDS),
      },
    )
  }

  if (!isNew && product.isPending) return <PageSpinner />
  const readOnly = !canManage
  const minQtyError =
    formState.errors.min_quantity?.message === 'positive'
      ? tc('validation:positive')
      : formState.errors.min_quantity?.message

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={isNew ? t('products.new') : (product.data?.name ?? t('products.edit'))}
        subtitle={readOnly ? t('products.readOnly') : product.data?.sku}
        actions={
          <>
            {!isNew && canViewStock && (
              <Button
                variant="secondary"
                icon={<Warehouse className="size-4" />}
                onClick={() => navigate(`/inventory/products/${id}`)}
              >
                {t('products.stockLink')}
              </Button>
            )}
            <Button
              variant="ghost"
              icon={<ArrowLeft className="size-4" />}
              onClick={() => navigate('/catalog/products')}
            >
              {tc('actions.back')}
            </Button>
          </>
        }
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={readOnly} className="space-y-6">
          {/* 1. Asosiy identifikatsiya */}
          <Card className="space-y-4">
            <h3 className="font-semibold text-slate-800">
              {tc('common.general', "Asosiy ma'lumotlar")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label={t('products.sku')} required error={formState.errors.sku?.message}>
                <Input
                  {...register('sku')}
                  className="uppercase"
                  invalid={!!formState.errors.sku}
                />
              </FormField>
              <FormField label={t('products.barcode')} error={formState.errors.barcode?.message}>
                <Input
                  {...register('barcode')}
                  inputMode="numeric"
                  invalid={!!formState.errors.barcode}
                  placeholder="Dona shtrix-kodi"
                />
              </FormField>
              <FormField label={t('products.unit')} required error={formState.errors.unit?.message}>
                <Select {...register('unit')}>
                  {units.data
                    ?.filter((u) => u.is_active !== false)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                </Select>
              </FormField>
            </div>
            <FormField label={t('products.name')} required error={formState.errors.name?.message}>
              <Input {...register('name')} invalid={!!formState.errors.name} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t('products.category')} error={formState.errors.category?.message}>
                <Select {...register('category')}>
                  <option value="">{t('products.noCategory')}</option>
                  {flat.map((c) => (
                    <option key={c.id} value={c.id}>
                      {indentLabel(c)}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                label={t('products.minQuantity')}
                hint={t('products.minQuantityHint')}
                error={minQtyError}
              >
                <Input {...register('min_quantity')} inputMode="decimal" />
              </FormField>
            </div>
            <FormField
              label={t('products.description')}
              error={formState.errors.description?.message}
            >
              <Textarea rows={2} {...register('description')} />
            </FormField>
          </Card>

          {/* 2. Xostavar: Qadoqlash (Karobka & Dona) */}
          <Card className="space-y-4 border-l-4 border-l-primary-500">
            <div className="flex items-center gap-2">
              <Boxes className="size-5 text-primary-600" />
              <h3 className="font-semibold text-slate-800">{t('products.packaging')}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label={t('products.boxName')} error={formState.errors.box_name?.message}>
                <Input {...register('box_name')} placeholder={t('products.boxNamePlaceholder')} />
              </FormField>
              <FormField
                label={t('products.unitsPerBox')}
                required
                error={formState.errors.units_per_box?.message}
              >
                <Input {...register('units_per_box')} type="number" min="1" placeholder="12" />
              </FormField>
              <FormField
                label={t('products.boxBarcode')}
                error={formState.errors.box_barcode?.message}
              >
                <Input {...register('box_barcode')} placeholder="Karobka ustidagi shtrix-kod" />
              </FormField>
            </div>
            <Controller
              control={control}
              name="allow_split_box"
              render={({ field }) => (
                <div className="flex items-center gap-3 pt-1">
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    label={t('products.allowSplitBox')}
                    disabled={readOnly}
                  />
                  <span className="text-sm text-slate-700">{t('products.allowSplitBox')}</span>
                </div>
              )}
            />
          </Card>

          {/* 3. Hajm (m³), O'lchamlar va Og'irlik */}
          <Card className="space-y-4 border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="size-5 text-teal-600" />
                <h3 className="font-semibold text-slate-800">{t('products.dimensions')}</h3>
              </div>
              {calculatedM3 && (
                <div className="rounded-lg bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                  {t('products.calculatedVolume')}: {calculatedM3} m³
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <FormField label={t('products.lengthCm')} error={formState.errors.length_cm?.message}>
                <Input {...register('length_cm')} inputMode="decimal" placeholder="sm" />
              </FormField>
              <FormField label={t('products.widthCm')} error={formState.errors.width_cm?.message}>
                <Input {...register('width_cm')} inputMode="decimal" placeholder="sm" />
              </FormField>
              <FormField label={t('products.heightCm')} error={formState.errors.height_cm?.message}>
                <Input {...register('height_cm')} inputMode="decimal" placeholder="sm" />
              </FormField>
              <FormField label={t('products.weightKg')} error={formState.errors.weight_kg?.message}>
                <Input {...register('weight_kg')} inputMode="decimal" placeholder="kg" />
              </FormField>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Controller
                control={control}
                name="is_fragile"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      label={t('products.isFragile')}
                      disabled={readOnly}
                    />
                    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
                      <ShieldAlert className="size-4 text-amber-500" />
                      <span>{t('products.isFragile')}</span>
                    </div>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      label={tc('fields.isActive')}
                      disabled={readOnly}
                    />
                    <span className="text-sm">{tc('fields.isActive')}</span>
                  </div>
                )}
              />
            </div>

            {!readOnly && (
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button variant="secondary" onClick={() => navigate('/catalog/products')}>
                  {tc('actions.cancel')}
                </Button>
                <Button type="submit" loading={save.isPending}>
                  {isNew ? tc('actions.create') : tc('actions.save')}
                </Button>
              </div>
            )}
          </Card>
        </fieldset>
      </form>

      <div className="mt-6">
        {isNew || !product.data ? (
          <Card>
            <p className="text-sm text-slate-500">{t('prices.saveFirst')}</p>
          </Card>
        ) : (
          <ProductPrices product={product.data} />
        )}
      </div>
    </div>
  )
}
