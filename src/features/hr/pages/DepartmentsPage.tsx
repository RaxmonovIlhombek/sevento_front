import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useCapability } from '@/features/auth'
import { applyServerErrors } from '@/shared/forms/serverErrors'
import { z } from '@/shared/forms/zod'
import {
  ActiveBadge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FormField,
  Input,
  Modal,
  PageHeader,
  Select,
  Switch,
  toast,
  type Column,
} from '@/shared/ui'

import {
  type Department,
  type Position,
  useCreateDepartment,
  useCreatePosition,
  useDeleteDepartment,
  useDeletePosition,
  useDepartments,
  usePositions,
  useUpdateDepartment,
  useUpdatePosition,
} from '../api/hr.api'

export function DepartmentsPage() {
  const canManage = useCapability('hr.manage')
  const departments = useDepartments()
  const positions = usePositions()
  const [editingDept, setEditingDept] = useState<Department | null | 'new'>(null)
  const [deletingDept, setDeletingDept] = useState<Department | null>(null)
  const [editingPos, setEditingPos] = useState<Position | null | 'new'>(null)
  const [deletingPos, setDeletingPos] = useState<Position | null>(null)

  const deleteDept = useDeleteDepartment()
  const deletePos = useDeletePosition()

  const deptColumns: Column<Department>[] = [
    { key: 'name', header: 'Nomi', render: (d) => <span className="font-medium">{d.name}</span> },
    {
      key: 'is_active',
      header: 'Holati',
      render: (d) => <ActiveBadge active={d.is_active ?? true} />,
    },
    ...(canManage
      ? [
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (d: Department) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Pencil className="size-4" />}
                  onClick={() => setEditingDept(d)}
                  aria-label="Tahrirlash"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setDeletingDept(d)}
                  aria-label="O'chirish"
                />
              </div>
            ),
          } satisfies Column<Department>,
        ]
      : []),
  ]

  const posColumns: Column<Position>[] = [
    { key: 'name', header: 'Nomi', render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'department_name', header: "Bo'lim", render: (p) => p.department_name },
    {
      key: 'is_active',
      header: 'Holati',
      render: (p) => <ActiveBadge active={p.is_active ?? true} />,
    },
    ...(canManage
      ? [
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (p: Position) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Pencil className="size-4" />}
                  onClick={() => setEditingPos(p)}
                  aria-label="Tahrirlash"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => setDeletingPos(p)}
                  aria-label="O'chirish"
                />
              </div>
            ),
          } satisfies Column<Position>,
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bo'limlar va lavozimlar"
        actions={
          canManage && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                icon={<Plus className="size-4" />}
                onClick={() => setEditingPos('new')}
              >
                Lavozim
              </Button>
              <Button icon={<Plus className="size-4" />} onClick={() => setEditingDept('new')}>
                Bo'lim
              </Button>
            </div>
          )
        }
      />

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-600">Bo'limlar</h2>
        {!departments.isPending && (departments.data ?? []).length === 0 ? (
          <EmptyState text="Bo'limlar yo'q" />
        ) : (
          <DataTable
            columns={deptColumns}
            rows={departments.data}
            rowKey={(d) => d.id}
            loading={departments.isPending}
          />
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-600">Lavozimlar</h2>
        {!positions.isPending && (positions.data ?? []).length === 0 ? (
          <EmptyState text="Lavozimlar yo'q" />
        ) : (
          <DataTable
            columns={posColumns}
            rows={positions.data}
            rowKey={(p) => p.id}
            loading={positions.isPending}
          />
        )}
      </Card>

      <DepartmentFormModal
        department={editingDept === 'new' ? undefined : (editingDept ?? undefined)}
        open={editingDept !== null}
        onClose={() => setEditingDept(null)}
      />
      <PositionFormModal
        position={editingPos === 'new' ? undefined : (editingPos ?? undefined)}
        departments={departments.data ?? []}
        open={editingPos !== null}
        onClose={() => setEditingPos(null)}
      />
      <ConfirmDialog
        open={deletingDept !== null}
        title="Bo'limni o'chirish"
        text={`"${deletingDept?.name}" bo'limini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        loading={deleteDept.isPending}
        onClose={() => setDeletingDept(null)}
        onConfirm={() => {
          if (!deletingDept) return
          deleteDept.mutate(deletingDept.id, {
            onSuccess: () => {
              toast.success("Bo'lim o'chirildi")
              setDeletingDept(null)
            },
            onError: () => toast.error("Bo'limni o'chirib bo'lmadi"),
          })
        }}
      />
      <ConfirmDialog
        open={deletingPos !== null}
        title="Lavozimni o'chirish"
        text={`"${deletingPos?.name}" lavozimini o'chirmoqchimisiz?`}
        confirmLabel="O'chirish"
        loading={deletePos.isPending}
        onClose={() => setDeletingPos(null)}
        onConfirm={() => {
          if (!deletingPos) return
          deletePos.mutate(deletingPos.id, {
            onSuccess: () => {
              toast.success("Lavozim o'chirildi")
              setDeletingPos(null)
            },
            onError: () => toast.error("Lavozimni o'chirib bo'lmadi"),
          })
        }}
      />
    </div>
  )
}

const deptSchema = z.object({
  name: z.string().trim().min(1).max(100),
  is_active: z.boolean(),
})
type DeptFormValues = z.infer<typeof deptSchema>

function DepartmentFormModal({
  department,
  open,
  onClose,
}: {
  department?: Department
  open: boolean
  onClose: () => void
}) {
  const create = useCreateDepartment()
  const update = useUpdateDepartment()
  const { register, handleSubmit, control, reset, setError, formState } = useForm<DeptFormValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: { name: department?.name ?? '', is_active: department?.is_active ?? true },
  })

  useEffect(() => {
    if (open) reset({ name: department?.name ?? '', is_active: department?.is_active ?? true })
  }, [open, department, reset])

  const onSubmit = (values: DeptFormValues) => {
    const onError = (error: unknown) => applyServerErrors(error, setError, Object.keys(values))
    if (department) {
      update.mutate(
        { id: department.id, body: values },
        {
          onSuccess: () => {
            toast.success("Bo'lim yangilandi")
            onClose()
          },
          onError,
        },
      )
    } else {
      create.mutate(values, {
        onSuccess: () => {
          toast.success("Bo'lim qo'shildi")
          onClose()
        },
        onError,
      })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={department ? "Bo'limni tahrirlash" : "Yangi bo'lim"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            form="department-form"
            loading={create.isPending || update.isPending}
          >
            {department ? 'Saqlash' : "Qo'shish"}
          </Button>
        </>
      }
    >
      <form id="department-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Nomi" required error={formState.errors.name?.message}>
          <Input {...register('name')} invalid={!!formState.errors.name} />
        </FormField>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch checked={field.value} onChange={field.onChange} label="Faol" />
              <span className="text-sm">Faol</span>
            </div>
          )}
        />
      </form>
    </Modal>
  )
}

const posSchema = z.object({
  name: z.string().trim().min(1).max(100),
  department: z.coerce.number<string>().int().positive(),
  is_active: z.boolean(),
})
type PosFormInput = z.input<typeof posSchema>
type PosFormValues = z.output<typeof posSchema>

function PositionFormModal({
  position,
  departments,
  open,
  onClose,
}: {
  position?: Position
  departments: Department[]
  open: boolean
  onClose: () => void
}) {
  const create = useCreatePosition()
  const update = useUpdatePosition()
  const defaults = useMemo(
    () => ({
      name: position?.name ?? '',
      department: String(position?.department ?? departments[0]?.id ?? ''),
      is_active: position?.is_active ?? true,
    }),
    [position, departments],
  )
  const { register, handleSubmit, control, reset, setError, formState } = useForm<
    PosFormInput,
    unknown,
    PosFormValues
  >({
    resolver: zodResolver(posSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (open) reset(defaults)
  }, [open, defaults, reset])

  const onSubmit = (values: PosFormValues) => {
    const onError = (error: unknown) => applyServerErrors(error, setError, Object.keys(values))
    if (position) {
      update.mutate(
        { id: position.id, body: values },
        {
          onSuccess: () => {
            toast.success('Lavozim yangilandi')
            onClose()
          },
          onError,
        },
      )
    } else {
      create.mutate(values, {
        onSuccess: () => {
          toast.success("Lavozim qo'shildi")
          onClose()
        },
        onError,
      })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={position ? 'Lavozimni tahrirlash' : 'Yangi lavozim'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" form="position-form" loading={create.isPending || update.isPending}>
            {position ? 'Saqlash' : "Qo'shish"}
          </Button>
        </>
      }
    >
      <form id="position-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Nomi" required error={formState.errors.name?.message}>
          <Input {...register('name')} invalid={!!formState.errors.name} />
        </FormField>
        <FormField label="Bo'lim" required error={formState.errors.department?.message}>
          <Select {...register('department')}>
            {departments.length === 0 && <option value="">Bo'lim yo'q</option>}
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </FormField>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch checked={field.value} onChange={field.onChange} label="Faol" />
              <span className="text-sm">Faol</span>
            </div>
          )}
        />
      </form>
    </Modal>
  )
}
