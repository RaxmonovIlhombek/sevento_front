import {
  Bot,
  Building2,
  Calendar,
  Camera,
  Clock,
  KeyRound,
  Laptop,
  Phone,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  User,
  UserCog,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { authApi, ChangePasswordModal, useAuthStore } from '@/features/auth'
import { use2FAStatus, useCurrentDevice, useMyLogins, type LoginEvent } from '@/features/security'
import { ApiError } from '@/shared/api/errors'
import { formatDate, formatDateTime } from '@/shared/lib/date'
import { fileToAvatarDataUrl, ImageError } from '@/shared/lib/image'
import { Avatar, Badge, Button, Card, DataTable, Spinner, toast, type Column } from '@/shared/ui'

const deviceIcons: Record<string, ReactNode> = {
  desktop: <Laptop className="size-5" />,
  mobile: <Smartphone className="size-5" />,
  tablet: <Tablet className="size-5" />,
  bot: <Bot className="size-5" />,
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
        {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-slate-400">{icon}</span>
      <span className="w-28 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
        {children || '—'}
      </span>
    </div>
  )
}

/** Shaxsiy akkaunt: rasm, ism-familiya, rol, xavfsizlik, qurilma va kirishlar. */
export function AccountPage() {
  const { t } = useTranslation('account')
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const device = useCurrentDevice()
  const logins = useMyLogins()
  const twoFactor = use2FAStatus()
  const fileRef = useRef<HTMLInputElement>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [now] = useState(() => Date.now())

  if (!user) return null

  const onPick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const image = await fileToAvatarDataUrl(file)
      setUser(await authApi.setAvatar(image))
      toast.success(t('photoSaved'))
    } catch (e) {
      if (e instanceof ImageError) toast.error(t(`photoError.${e.code}`))
      else toast.error(e instanceof ApiError ? e.message : t('photoError.generic'))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onRemove = async () => {
    setBusy(true)
    try {
      setUser(await authApi.removeAvatar())
      toast.success(t('photoRemoved'))
    } catch {
      toast.error(t('photoError.generic'))
    } finally {
      setBusy(false)
    }
  }

  const days = Math.max(0, Math.floor((now - new Date(user.date_joined).getTime()) / 86_400_000))
  const lastLogin = logins.data?.find((e) => e.success)
  const branches = user.all_branches
    ? t('allBranches')
    : user.branches.map((b) => b.name).join(', ')
  const dev = device.data
  const devName = dev ? [dev.browser, dev.os].filter(Boolean).join(' · ') || t('unknown') : ''

  const columns: Column<LoginEvent>[] = [
    {
      key: 'when',
      header: t('when'),
      render: (e) => <span className="whitespace-nowrap">{formatDateTime(e.created_at)}</span>,
    },
    {
      key: 'device',
      header: t('device'),
      render: (e) => [e.browser, e.os].filter(Boolean).join(' · ') || '—',
    },
    { key: 'ip', header: t('ip'), render: (e) => e.ip || '—' },
    {
      key: 'result',
      header: t('result'),
      render: (e) =>
        e.success ? (
          <Badge tone="success">{t('ok')}</Badge>
        ) : (
          <Badge tone="danger">{t('failed')}</Badge>
        ),
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Profil kartasi */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-brand-800 via-brand-600 to-emerald-400 sm:h-36">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.25),transparent_55%)]" />
        </div>
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="group relative">
                <Avatar
                  src={user.avatar}
                  name={user.full_name}
                  size="xl"
                  className="ring-4 ring-white shadow-md"
                />
                <button
                  type="button"
                  aria-label={t('changePhoto')}
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/0 text-white opacity-0 transition group-hover:bg-slate-900/45 group-hover:opacity-100 focus-visible:bg-slate-900/45 focus-visible:opacity-100 focus-visible:outline-none"
                >
                  <Camera className="size-7" />
                </button>
                <button
                  type="button"
                  aria-label={t('changePhoto')}
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="absolute right-0 bottom-1 flex size-9 items-center justify-center rounded-full bg-brand-700 text-white shadow-md ring-2 ring-white transition hover:bg-brand-800 disabled:opacity-60"
                >
                  {busy ? <Spinner className="size-4" /> : <Camera className="size-4" />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onPick(e.target.files?.[0])}
                />
              </div>
              <div className="pb-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {user.full_name}
                </h1>
                <p className="text-sm text-slate-500">@{user.username}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {user.role && <Badge tone="brand">{user.role.name}</Badge>}
                  {user.is_superuser && <Badge tone="info">{t('superuser')}</Badge>}
                  <Badge tone="success">{t('active')}</Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 sm:pb-1">
              <Button
                variant="secondary"
                size="sm"
                icon={<Camera className="size-4" />}
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                {user.avatar ? t('changePhoto') : t('uploadPhoto')}
              </Button>
              {user.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="size-4" />}
                  onClick={() => void onRemove()}
                  disabled={busy}
                  aria-label={t('removePhoto')}
                  title={t('removePhoto')}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tezkor ko'rsatkichlar */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          icon={<Clock className="size-5" />}
          label={t('lastLogin')}
          value={lastLogin ? formatDateTime(lastLogin.created_at) : '—'}
        />
        <Stat
          icon={<Calendar className="size-5" />}
          label={t('memberSince')}
          value={formatDate(user.date_joined)}
          hint={t('daysAgo', { count: days })}
        />
        <Stat
          icon={<Building2 className="size-5" />}
          label={t('branches')}
          value={branches || '—'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Shaxsiy ma'lumotlar */}
        <Card>
          <h2 className="mb-1 text-base font-semibold text-slate-900">{t('personal')}</h2>
          <div className="divide-y divide-slate-100">
            <InfoRow icon={<User className="size-4" />} label={t('fullName')}>
              {user.full_name}
            </InfoRow>
            <InfoRow icon={<UserCog className="size-4" />} label={t('username')}>
              @{user.username}
            </InfoRow>
            <InfoRow icon={<Phone className="size-4" />} label={t('phone')}>
              {user.phone}
            </InfoRow>
            <InfoRow icon={<ShieldCheck className="size-4" />} label={t('role')}>
              {user.role?.name}
            </InfoRow>
          </div>
        </Card>

        {/* Xavfsizlik */}
        <Card>
          <h2 className="mb-3 text-base font-semibold text-slate-900">{t('security')}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <span className="text-slate-500">
                {dev ? (
                  (deviceIcons[dev.device_type] ?? <Laptop className="size-5" />)
                ) : (
                  <Spinner className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-xs text-slate-500">{t('thisDevice')}</p>
                <p className="truncate text-sm font-medium text-slate-900">{devName}</p>
                {dev && (
                  <p className="truncate text-xs text-slate-500">
                    {dev.device_type ? t(`deviceType.${dev.device_type}`) : ''}
                    {dev.ip ? ` · IP ${dev.ip}` : ''}
                  </p>
                )}
              </div>
              <Badge tone="success">{t('current')}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <ShieldCheck className="size-4 text-slate-500" />
                {t('twoFactor')}
              </div>
              <Badge tone={twoFactor.data?.enabled ? 'success' : 'neutral'}>
                {twoFactor.data?.enabled ? t('on') : t('off')}
              </Badge>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              icon={<KeyRound className="size-4" />}
              onClick={() => setPasswordOpen(true)}
            >
              {t('changePassword')}
            </Button>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="mb-2 text-base font-semibold text-slate-900">{t('myLogins')}</h2>
        <DataTable
          columns={columns}
          rows={logins.data}
          rowKey={(e) => e.id}
          loading={logins.isPending}
          emptyText={t('empty')}
        />
      </section>

      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  )
}
