import { Plus, UserMinus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { useAuthStore } from '@/features/auth'
import { errorMessage } from '@/shared/api/errors'
import { useListParams } from '@/shared/hooks/useListParams'
import { formatDate } from '@/shared/lib/date'
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  FormField,
  Input,
  Modal,
  PageHeader,
  PhoneInput,
  SearchInput,
  Select,
  toast,
  type Column,
} from '@/shared/ui'

import {
  useEmployees,
  useHireEmployee,
  useHireOptions,
  useTerminateEmployee,
  type Employee,
  type HireBody,
} from '../api/hr.api'

const STATUS: Record<
  string,
  { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  active: { label: 'Ishlayapti', tone: 'success' },
  on_leave: { label: "Ta'tilda", tone: 'warning' },
  terminated: { label: "Bo'shatilgan", tone: 'danger' },
}

export function EmployeesPage() {
  const capabilities = useAuthStore((s) => s.user?.capabilities ?? [])
  const canStaff = capabilities.includes('hr.manage') || capabilities.includes('hr.staff.manage')
  const { params, set } = useListParams()
  const options = useHireOptions(canStaff)
  const employees = useEmployees({
    page: 1,
    page_size: 100,
    search: params.search || undefined,
    branch: params.branch || undefined,
    status: params.status || undefined,
  })
  const terminate = useTerminateEmployee()
  const [hireOpen, setHireOpen] = useState(false)
  const [toTerminate, setToTerminate] = useState<Employee | null>(null)

  const columns: Column<Employee>[] = [
    { key: 'employee_number', header: 'Raqam' },
    {
      key: 'name',
      header: 'Xodim',
      render: (e) => (
        <div>
          <p className="font-medium">{e.user_full_name}</p>
          <p className="text-xs text-slate-500">{e.user_username}</p>
        </div>
      ),
    },
    { key: 'branch_name', header: 'Nuqta' },
    { key: 'department_name', header: "Bo'lim" },
    { key: 'position_name', header: 'Lavozim' },
    { key: 'hire_date', header: 'Ishga kirgan', render: (e) => formatDate(e.hire_date) },
    {
      key: 'status',
      header: 'Holat',
      render: (e) => {
        const st = STATUS[e.status ?? ''] ?? { label: e.status ?? '—', tone: 'neutral' as const }
        return <Badge tone={st.tone}>{st.label}</Badge>
      },
    },
    ...(canStaff
      ? [
          {
            key: 'actions',
            header: '',
            render: (e: Employee) =>
              e.status === 'terminated' ? null : (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<UserMinus className="size-4" />}
                  onClick={() => setToTerminate(e)}
                  aria-label={`${e.user_full_name}: ishdan bo'shatish`}
                />
              ),
          } satisfies Column<Employee>,
        ]
      : []),
  ]

  const branches = options.data?.branches ?? []

  return (
    <div>
      <PageHeader
        title="Xodimlar"
        actions={
          canStaff && (
            <Button icon={<Plus className="size-4" />} onClick={() => setHireOpen(true)}>
              Yangi xodim
            </Button>
          )
        }
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <SearchInput
          value={params.search ?? ''}
          onChange={(v) => set({ search: v })}
          placeholder="Ism, login yoki raqam"
          className="w-full sm:w-72"
        />
        {branches.length > 1 && (
          <Select
            value={params.branch ?? ''}
            onChange={(e) => set({ branch: e.target.value })}
            className="w-full sm:w-48"
          >
            <option value="">Barcha nuqtalar</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        )}
        <Select
          value={params.status ?? ''}
          onChange={(e) => set({ status: e.target.value })}
          className="w-full sm:w-44"
        >
          <option value="">Barcha holatlar</option>
          <option value="active">Ishlayapti</option>
          <option value="on_leave">Ta'tilda</option>
          <option value="terminated">Bo'shatilgan</option>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={employees.data?.results}
        rowKey={(e) => e.id}
        loading={employees.isFetching}
      />

      {canStaff && (
        <HireModal open={hireOpen} onClose={() => setHireOpen(false)} options={options.data} />
      )}

      <ConfirmDialog
        open={toTerminate !== null}
        onClose={() => setToTerminate(null)}
        title="Ishdan bo'shatish"
        text={`${toTerminate?.user_full_name ?? ''} ishdan bo'shatiladi va tizimga kira olmaydi. Davom etasizmi?`}
        confirmLabel="Bo'shatish"
        danger
        loading={terminate.isPending}
        onConfirm={() => {
          if (!toTerminate) return
          terminate.mutate(toTerminate.id, {
            onSuccess: () => {
              toast.success(`${toTerminate.user_full_name} ishdan bo'shatildi`)
              setToTerminate(null)
            },
            onError: (error) => toast.error(errorMessage(error)),
          })
        }}
      />
    </div>
  )
}

const EMPTY = {
  full_name: '',
  username: '',
  password: '',
  phone: '',
  role: '',
  branch: '',
  department: '',
  position: '',
  base_salary: '',
}

function HireModal({
  open,
  onClose,
  options,
}: {
  open: boolean
  onClose: () => void
  options: ReturnType<typeof useHireOptions>['data']
}) {
  const hire = useHireEmployee()
  const [form, setForm] = useState(EMPTY)
  const patch = (changes: Partial<typeof EMPTY>) => setForm((f) => ({ ...f, ...changes }))

  // Bitta nuqta ruxsat etilgan bo'lsa (filial rahbari) — o'zi tanlanadi, o'zgartirib bo'lmaydi
  const branches = options?.branches ?? []
  const branchId = form.branch || (branches.length === 1 ? String(branches[0].id) : '')
  const positions = useMemo(
    () => (options?.positions ?? []).filter((p) => String(p.department) === form.department),
    [options, form.department],
  )
  const valid =
    form.full_name.trim() &&
    form.username.trim() &&
    form.password.length >= 8 &&
    form.role &&
    branchId &&
    form.department &&
    form.position

  const close = () => {
    setForm(EMPTY)
    onClose()
  }

  const submit = () => {
    const body: HireBody = {
      full_name: form.full_name.trim(),
      username: form.username.trim(),
      password: form.password,
      phone: form.phone,
      role: Number(form.role),
      branch: Number(branchId),
      department: Number(form.department),
      position: Number(form.position),
      ...(form.base_salary ? { base_salary: form.base_salary } : {}),
    }
    hire.mutate(body, {
      onSuccess: () => {
        toast.success(`${body.full_name} qo'shildi`)
        close()
      },
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Yangi xodim"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Bekor qilish
          </Button>
          <Button loading={hire.isPending} disabled={!valid} onClick={submit}>
            Qo'shish
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="F.I.Sh." required className="sm:col-span-2">
          <Input value={form.full_name} onChange={(e) => patch({ full_name: e.target.value })} />
        </FormField>
        <FormField label="Rol" required hint="Rol xodim nimani ko'rishini belgilaydi">
          <Select value={form.role} onChange={(e) => patch({ role: e.target.value })}>
            <option value="">Tanlang</option>
            {options?.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Nuqta (filial)"
          required
          hint="Xodim faqat shu nuqta ma'lumotlarini ko'radi"
        >
          <Select
            value={branchId}
            onChange={(e) => patch({ branch: e.target.value })}
            disabled={branches.length === 1}
          >
            <option value="">Tanlang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Bo'lim" required>
          <Select
            value={form.department}
            onChange={(e) => patch({ department: e.target.value, position: '' })}
          >
            <option value="">Tanlang</option>
            {options?.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Lavozim" required>
          <Select
            value={form.position}
            onChange={(e) => patch({ position: e.target.value })}
            disabled={!form.department}
          >
            <option value="">Tanlang</option>
            {positions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Login" required>
          <Input
            value={form.username}
            onChange={(e) => patch({ username: e.target.value })}
            autoComplete="off"
          />
        </FormField>
        <FormField label="Parol" required hint="Kamida 8 belgi">
          <Input
            type="password"
            value={form.password}
            onChange={(e) => patch({ password: e.target.value })}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Telefon">
          <PhoneInput value={form.phone} onChange={(v) => patch({ phone: v })} />
        </FormField>
        <FormField label="Oylik (so'm)">
          <Input
            inputMode="decimal"
            value={form.base_salary}
            onChange={(e) => patch({ base_salary: e.target.value.replace(/[^\d.]/g, '') })}
          />
        </FormField>
      </div>
    </Modal>
  )
}
