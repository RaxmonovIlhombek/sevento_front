import {
  Banknote,
  BookOpen,
  Boxes,
  ArrowLeftRight,
  Building2,
  ClipboardList,
  Coins,
  FolderTree,
  Package,
  PackageCheck,
  Receipt,
  Truck,
  Warehouse,
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
    labelKey: 'inventory',
    icon: Warehouse,
    children: [
      {
        to: '/inventory/stock',
        labelKey: 'stock',
        icon: PackageCheck,
        capability: 'inventory.view',
      },
      {
        to: '/inventory/movements',
        labelKey: 'movements',
        icon: ArrowLeftRight,
        capability: 'inventory.view',
      },
      {
        to: '/purchasing/purchases',
        labelKey: 'purchases',
        icon: ClipboardList,
        capability: 'purchasing.view',
      },
      {
        to: '/purchasing/suppliers',
        labelKey: 'suppliers',
        icon: Truck,
        capability: 'purchasing.view',
      },
      {
        to: '/purchasing/expense-types',
        labelKey: 'expenseTypes',
        icon: Receipt,
        capability: 'purchasing.manage',
      },
    ],
  },
  {
    labelKey: 'catalog',
    icon: Boxes,
    children: [
      { to: '/catalog/products', labelKey: 'products', icon: Package, capability: 'catalog.view' },
      {
        to: '/catalog/categories',
        labelKey: 'categories',
        icon: FolderTree,
        capability: 'catalog.view',
      },
      {
        to: '/catalog/references',
        labelKey: 'references',
        icon: BookOpen,
        capability: 'catalog.view',
      },
      { to: '/currency', labelKey: 'currencyRates', icon: Banknote },
    ],
  },
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
        to: '/settings/currencies',
        labelKey: 'currencies',
        icon: Coins,
        capability: 'settings.manage',
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
