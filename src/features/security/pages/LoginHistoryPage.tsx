import { Laptop, Smartphone, Tablet, Bot, HelpCircle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useListParams } from '@/shared/hooks/useListParams'
import { formatDateTime } from '@/shared/lib/date'
import {
  Badge,
  Button,
  DataTable,
  FormField,
  Input,
  PageHeader,
  Pagination,
  Select,
  type Column,
} from '@/shared/ui'

import {
  useLoginEvents,
  useLoginSummary,
  type LoginEvent,
  type UserLoginSummary,
} from '../api/security.api'

type Tab = 'users' | 'events'

const deviceIcons: Record<string, ReactNode> = {
  desktop: <Laptop className="size-4" />,
  mobile: <Smartphone className="size-4" />,
  tablet: <Tablet className="size-4" />,
  bot: <Bot className="size-4" />,
}

function DeviceCell({ type, browser, os }: { type: string; browser: string; os: string }) {
  const { t } = useTranslation('security')
  if (!type && !browser && !os) return <span className="text-slate-400">—</span>
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500">
        {deviceIcons[type] ?? <HelpCircle className="size-4" />}
      </span>
      <div className="leading-tight">
        <div className="font-medium">
          {[browser, os].filter(Boolean).join(' · ') || t('unknown')}
        </div>
        {type && <div className="text-xs text-slate-500">{t(`deviceType.${type}`, type)}</div>}
      </div>
    </div>
  )
}

/** Kim, qachon va qaysi qurilmadan kirgani: foydalanuvchilar kesimi va barcha urinishlar jurnali. */
export function LoginHistoryPage() {
  const { t } = useTranslation('security')
  const { t: tc } = useTranslation()
  const [tab, setTab] = useState<Tab>('users')

  return (
    <div>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {(['users', 'events'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>
      {tab === 'users' ? <UsersTab /> : <EventsTab resetLabel={tc('actions.reset')} />}
    </div>
  )
}

function UsersTab() {
  const { t } = useTranslation('security')
  const summary = useLoginSummary()

  const columns: Column<UserLoginSummary>[] = [
    {
      key: 'user',
      header: t('user'),
      render: (u) => (
        <div className="leading-tight">
          <div className="font-medium">{u.full_name || u.username}</div>
          <div className="text-xs text-slate-500">
            @{u.username}
            {u.role_name ? ` · ${u.role_name}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'last_login',
      header: t('lastLogin'),
      render: (u) =>
        u.last_login ? (
          <span className="whitespace-nowrap">{formatDateTime(u.last_login)}</span>
        ) : (
          <span className="text-slate-400">{t('never')}</span>
        ),
    },
    {
      key: 'device',
      header: t('device'),
      render: (u) => (
        <DeviceCell type={u.last_device_type} browser={u.last_browser} os={u.last_os} />
      ),
    },
    { key: 'ip', header: t('ip'), render: (u) => u.last_ip || '—' },
    {
      key: 'logins',
      header: t('logins30d'),
      className: 'text-right tabular-nums',
      render: (u) => u.logins_30d,
    },
    {
      key: 'failed',
      header: t('failed30d'),
      className: 'text-right tabular-nums',
      render: (u) =>
        u.failed_30d > 0 ? <Badge tone="danger">{u.failed_30d}</Badge> : <span>0</span>,
    },
    {
      key: 'active',
      header: '',
      render: (u) => (u.is_active ? null : <Badge tone="neutral">{t('inactive')}</Badge>),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={summary.data}
      rowKey={(u) => u.id}
      loading={summary.isPending}
      emptyText={t('empty')}
    />
  )
}

function EventsTab({ resetLabel }: { resetLabel: string }) {
  const { t } = useTranslation('security')
  const { params, page, set, setPage } = useListParams()
  const events = useLoginEvents({
    page,
    search: params.search,
    success: params.success,
    date_from: params.date_from,
    date_to: params.date_to,
  })

  const columns: Column<LoginEvent>[] = [
    {
      key: 'when',
      header: t('when'),
      render: (e) => <span className="whitespace-nowrap">{formatDateTime(e.created_at)}</span>,
    },
    {
      key: 'user',
      header: t('user'),
      render: (e) => (
        <div className="leading-tight">
          <div className="font-medium">{e.user_full_name || e.username}</div>
          <div className="text-xs text-slate-500">
            @{e.username}
            {e.role_name ? ` · ${e.role_name}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'device',
      header: t('device'),
      render: (e) => <DeviceCell type={e.device_type} browser={e.browser} os={e.os} />,
    },
    { key: 'ip', header: t('ip'), render: (e) => e.ip || '—' },
    {
      key: 'result',
      header: t('result'),
      render: (e) =>
        e.success ? (
          <Badge tone="success">{t('ok')}</Badge>
        ) : (
          <div className="leading-tight">
            <Badge tone="danger">{t('failed')}</Badge>
            {e.reason && (
              <div className="mt-0.5 text-xs text-slate-500">
                {t(`reason.${e.reason}`, e.reason)}
              </div>
            )}
          </div>
        ),
    },
  ]

  return (
    <>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <FormField label={t('filters.search')} className="w-full sm:w-64">
          <Input value={params.search ?? ''} onChange={(e) => set({ search: e.target.value })} />
        </FormField>
        <FormField label={t('filters.status')}>
          <Select value={params.success ?? ''} onChange={(e) => set({ success: e.target.value })}>
            <option value="">{t('filters.all')}</option>
            <option value="true">{t('ok')}</option>
            <option value="false">{t('failed')}</option>
          </Select>
        </FormField>
        <FormField label={t('filters.dateFrom')}>
          <Input
            type="date"
            value={params.date_from ?? ''}
            onChange={(e) => set({ date_from: e.target.value })}
          />
        </FormField>
        <FormField label={t('filters.dateTo')}>
          <Input
            type="date"
            value={params.date_to ?? ''}
            onChange={(e) => set({ date_to: e.target.value })}
          />
        </FormField>
        <Button
          variant="ghost"
          className="h-10"
          onClick={() => set({ search: null, success: null, date_from: null, date_to: null })}
        >
          {resetLabel}
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={events.data?.results}
        rowKey={(e) => e.id}
        loading={events.isPending}
        emptyText={t('empty')}
      />
      <div className="mt-3">
        <Pagination
          page={page}
          totalPages={events.data?.total_pages ?? 1}
          count={events.data?.count ?? 0}
          onChange={setPage}
        />
      </div>
    </>
  )
}
