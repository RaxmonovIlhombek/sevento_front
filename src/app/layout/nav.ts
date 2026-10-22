import {
  Building2,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to?: string
  labelKey: string
  icon: LucideIcon
  capability?: string
  children?: NavItem[]
}

/** Menyu. capability berilmagan band hammaga ko'rinadi; bolalari bo'sh qolgan guruh yashiriladi. */
export const navItems: NavItem[] = [
  { to: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  {
    labelKey: 'settings',
    icon: Settings,
    children: [
      { to: '/settings/users', labelKey: 'users', icon: Users, capability: 'users.manage' },
      { to: '/settings/roles', labelKey: 'roles', icon: ShieldCheck, capability: 'users.manage' },
      {
        to: '/settings/branches',
        labelKey: 'branches',
        icon: Building2,
        capability: 'branches.manage',
      },
      {
        to: '/settings/system',
        labelKey: 'system',
        icon: SlidersHorizontal,
        capability: 'settings.manage',
      },
    ],
  },
  { to: '/audit', labelKey: 'audit', icon: ScrollText, capability: 'audit.view' },
]

export function filterNav(items: NavItem[], capabilities: readonly string[]): NavItem[] {
  return items.flatMap((item) => {
    if (item.capability && !capabilities.includes(item.capability)) return []
    if (item.children) {
      const children = filterNav(item.children, capabilities)
      return children.length ? [{ ...item, children }] : []
    }
    return [item]
  })
}
