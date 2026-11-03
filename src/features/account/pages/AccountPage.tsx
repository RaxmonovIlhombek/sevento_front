import { Bot, KeyRound, Laptop, ShieldCheck, Smartphone, Tablet } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ChangePasswordModal, useAuthStore, useCapabilities } from '@/features/auth'
import { use2FAStatus, useCurrentDevice, useMyLogins, type LoginEvent } from '@/features/security'
import { formatDateTime } from '@/shared/lib/date'
import { Badge, Button, Card, DataTable, PageHeader, type Column } from '@/shared/ui'

const deviceIcons: Record<string, ReactNode> = {
  desktop: <Laptop className="size-5" />,
  mobile: <Smartphone className="size-5" />,
  tablet: <Tablet className="size-5" />,
  bot: <Bot className="size-5" />,
}

function initials(name: string | undefined): string {
  return (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{children || '—'}</span>
    </div>
  )
}

/** Shaxsiy akkaunt: kim ekanligi, huquqlari, qaysi qurilmadan kirgani, parol va kirishlar tarixi. */
export function AccountPage() {
  const { t } = useTranslation('account')
  const user = useAuthStore((s) => s.user)
  const capabilities = useCapabilities()
  const device = useCurrentDevice()
  const logins = useMyLogins()
  const twoFactor = use2FAStatus()
  const [passwordOpen, setPasswordOpen] = useState(false)

  if (!user) return null

  const owned = new Set(user.capabilities)
  const groups = new Map<string, { code: string; name: string }[]>()
  for (const cap of capabilities.data ?? []) {
    if (!owned.has(cap.code)) continue
    groups.set(cap.group, [...(groups.get(cap.group) ?? []), cap])
  }

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

  const lastLogin = logins.data?.find((e) => e.success)

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
              {initials(user.full_name)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{user.full_name}</h2>
              <p className="text-sm text-slate-500">@{user.username}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {user.role && <Badge tone="brand">{user.role.name}</Badge>}
                {user.is_superuser && <Badge tone="info">{t('superuser')}</Badge>}
              </div>
            </div>
          </div>
          <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
            <Row label={t('phone')}>{user.phone}</Row>
            <Row label={t('branches')}>
              {user.all_branches ? t('allBranches') : user.branches.map((b) => b.name).join(', ')}
            </Row>
            <Row label={t('lastLogin')}>
              {lastLogin ? formatDateTime(lastLogin.created_at) : ''}
            </Row>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">{t('thisDevice')}</h3>
            {device.data && (
              <div className="flex items-center gap-3">
                <span className="text-slate-500">
                  {deviceIcons[device.data.device_type] ?? <Laptop className="size-5" />}
                </span>
                <div className="leading-tight">
                  <div className="font-medium">
                    {[device.data.browser, device.data.os].filter(Boolean).join(' · ') ||
                      t('unknown')}
                  </div>
                  <div className="text-xs text-slate-500">
                    {device.data.device_type ? t(`deviceType.${device.data.device_type}`) : ''}
                    {device.data.ip ? ` · IP ${device.data.ip}` : ''}
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">{t('security')}</h3>
            <Button
              variant="secondary"
              className="w-full justify-start"
              icon={<KeyRound className="size-4" />}
              onClick={() => setPasswordOpen(true)}
            >
              {t('changePassword')}
            </Button>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="size-4" />
              <span>{t('twoFactor')}:</span>
              <Badge tone={twoFactor.data?.enabled ? 'success' : 'neutral'}>
                {twoFactor.data?.enabled ? t('on') : t('off')}
              </Badge>
            </div>
          </Card>
        </div>
      </div>

      <h3 className="mt-6 mb-2 text-base font-semibold">{t('permissions')}</h3>
      <Card>
        {groups.size === 0 ? (
          <p className="text-sm text-slate-500">{t('noPermissions')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...groups.entries()].map(([group, caps]) => (
              <div key={group}>
                <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {group}
                </p>
                <ul className="space-y-0.5 text-sm">
                  {caps.map((c) => (
                    <li key={c.code} className="flex gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{c.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      <h3 className="mt-6 mb-2 text-base font-semibold">{t('myLogins')}</h3>
      <DataTable
        columns={columns}
        rows={logins.data}
        rowKey={(e) => e.id}
        loading={logins.isPending}
        emptyText={t('empty')}
      />

      <ChangePasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </div>
  )
}
