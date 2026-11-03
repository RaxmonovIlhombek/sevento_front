import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useLocation } from 'react-router'

import { useAuthStore } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui'

import { BranchSwitcher } from './BranchSwitcher'
import { ConnectionIndicator, OfflineBanner } from './ConnectionIndicator'
import { activeNavPath, filterNav, navItems } from './nav'
import { useNavBadges } from './useNavBadges'

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)

  const items = filterNav(navItems, user?.capabilities ?? [])
  const { pathname } = useLocation()
  const activePath = activeNavPath(pathname, items)
  // qabul qiluvchi nuqtaga: kutilayotgan ko'chirishlar soni (transfer.* xabari bilan yangilanadi)
  const badges = useNavBadges()

  // Faol tanlangan guruh (bolalari bor guruh bo'lsa, uning ichki sahifalari tepada tablar ko'rinishida chiqadi)
  const activeGroup = items.find((item) =>
    item.children?.some(
      (child) => child.to === activePath || (child.to && pathname.startsWith(`${child.to}/`)),
    ),
  )

  const nav = (
    <nav className="flex-1 space-y-1.5 px-3 py-4">
      {items.map((item) => {
        if (item.children) {
          const isGroupActive = item === activeGroup
          const firstChildTo = item.children[0]?.to ?? '#'
          // Guruhdagi umumiy bildirishnomalar soni
          const groupBadgeCount = item.children.reduce(
            (sum, child) => sum + (child.badge ? badges[child.badge] : 0),
            0,
          )

          return (
            <Link
              key={item.labelKey}
              to={firstChildTo}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all',
                isGroupActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="flex-1">{t(`nav:${item.labelKey}`)}</span>
              {groupBadgeCount > 0 && (
                <span className="rounded-full bg-sky-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {groupBadgeCount}
                </span>
              )}
            </Link>
          )
        }

        return (
          <NavItemLink
            key={item.to}
            to={item.to!}
            active={item.to === activePath}
            icon={item.icon}
            label={t(`nav:${item.labelKey}`)}
            badge={item.badge ? badges[item.badge] : 0}
            onClick={() => setMobileOpen(false)}
          />
        )
      })}
    </nav>
  )

  const userBlock = (
    <div className="border-t border-slate-800 p-3">
      <Link
        to="/account"
        onClick={() => setMobileOpen(false)}
        title={t('nav:account')}
        className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-slate-800/80"
      >
        <Avatar src={user?.avatar} name={user?.full_name ?? ''} size="md" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-white">{user?.full_name}</span>
          <span className="block truncate text-xs text-slate-400">
            {user?.role?.name ?? user?.username}
          </span>
        </span>
      </Link>
    </div>
  )

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-slate-900 text-slate-200 lg:flex">
        <div className="flex h-14 items-center gap-2 px-4 text-lg font-bold text-white">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-600">S</span>
          {t('app')}
        </div>
        {nav}
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-slate-900 text-slate-200 shadow-xl">
            <div className="flex h-14 items-center justify-between px-4 text-lg font-bold text-white">
              {t('app')}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded p-1 hover:bg-slate-800"
                aria-label={t('actions.close')}
              >
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {userBlock}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
          {activeGroup && (
            <div className="hidden items-center gap-2 font-semibold text-slate-800 lg:flex">
              <activeGroup.icon className="size-5 text-brand-600" />
              <span>{t(`nav:${activeGroup.labelKey}`)}</span>
            </div>
          )}
          <div className="flex-1" />
          <ConnectionIndicator />
          <BranchSwitcher />
        </header>
        {activeGroup?.children && activeGroup.children.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-50/90 px-4 py-2 text-sm backdrop-blur">
            {activeGroup.children.map((child) => {
              const isActive =
                child.to === activePath || (child.to && pathname.startsWith(`${child.to}/`))
              const badgeCount = child.badge ? badges[child.badge] : 0
              return (
                <Link
                  key={child.to}
                  to={child.to!}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900',
                  )}
                >
                  <child.icon className="size-4" />
                  <span>{t(`nav:${child.labelKey}`)}</span>
                  {badgeCount > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-xs font-semibold',
                        isActive ? 'bg-white text-brand-700' : 'bg-brand-600 text-white',
                      )}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
        <OfflineBanner />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NavItemLink({
  to,
  active,
  icon: Icon,
  label,
  badge = 0,
  onClick,
}: {
  to: string
  active: boolean
  icon: typeof Menu
  label: string
  badge?: number
  onClick?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-brand-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span
          className="rounded-full bg-sky-500 px-1.5 text-xs font-semibold text-white"
          data-testid="nav-badge"
        >
          {badge}
        </span>
      )}
    </Link>
  )
}
