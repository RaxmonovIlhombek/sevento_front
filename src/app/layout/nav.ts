import {
  Banknote,
  BookOpen,
  Boxes,
  ArrowLeftRight,
  ArrowRightLeft,
  Briefcase,
  Building,
  BadgeCheck,
  CalendarCheck,
  CalendarRange,
  ListChecks,
  ClipboardCheck,
  FileBarChart,
  Factory,
  ListX,
  Megaphone,
  PackageX,
  Undo2,
  Building2,
  ClipboardList,
  Coins,
  CreditCard,
  FolderTree,
  HandCoins,
  Landmark,
  Package,
  PackageCheck,
  Receipt,
  ShoppingCart,
  Target,
  Truck,
  Warehouse,
  LayoutDashboard,
  NotebookPen,
  ScrollText,
  History,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to?: string
  labelKey: string
  icon: LucideIcon
  /** Bitta huquq yoki ro'yxat (birortasi yetarli) */
  capability?: string | readonly string[]
  /** Menyuda son ko'rsatkichi (masalan qabul qilinishi kutilayotgan ko'chirishlar) */
  badge?: 'incomingTransfers' | 'approvalsAssigned'
  children?: NavItem[]
}

/** Ko'chirishlarni ko'ra oladiganlar (backend TransferViewSet bilan bir xil). */
export const TRANSFER_VIEW_CAPS = [
  'inventory.transfers.create',
  'inventory.transfers.receive',
  'inventory.view_cost',
] as const

/** Backend `hr.view` va boshqa *.view huquqlarini majburan tekshiradi. */
/** Buyurtma jarayonini ko'ra oladiganlar: rahbar, omborchi, operator, kuryer, sotuvchi. */
export const FULFILLMENT_VIEW_CAPS = [
  'fulfillment.view',
  'fulfillment.pack',
  'fulfillment.verify',
  'deliveries.view',
] as const
export const HR_VIEW_CAPS = ['hr.view'] as const
export const ACCOUNTING_VIEW_CAPS = ['accounting.view'] as const
export const PAYROLL_VIEW_CAPS = ['payroll.view'] as const
export const CRM_VIEW_CAPS = ['crm.view'] as const
export const MANUFACTURING_VIEW_CAPS = ['manufacturing.view'] as const

/**
 * Menyu guruhlari tartibi: ish jarayoniga qarab.
 * Guruh bo'sh qolsa (huquq yo'q) yashiriladi.
 */
export const navItems: NavItem[] = [
  { to: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },

  // 1. Kassa va savdo
  {
    labelKey: 'sales',
    icon: ShoppingCart,
    children: [
      { to: '/sales/pos', labelKey: 'pos', icon: ShoppingCart, capability: 'sales.create' },
      {
        to: '/sales/ready-products',
        labelKey: 'readyProducts',
        icon: Boxes,
        capability: 'sales.view',
      },
      { to: '/sales', labelKey: 'salesList', icon: Receipt, capability: 'sales.view' },
      { to: '/sales/returns', labelKey: 'returns', icon: Undo2, capability: 'sales.view' },
    ],
  },

  // 2. Mijozlar va pul oqimi
  {
    labelKey: 'payments',
    icon: HandCoins,
    children: [
      { to: '/customers', labelKey: 'customers', icon: Users, capability: 'customers.view' },
      { to: '/debts', labelKey: 'debts', icon: NotebookPen, capability: 'debts.view' },
      { to: '/payments', labelKey: 'paymentsJournal', icon: Banknote, capability: 'payments.view' },
      { to: '/cash', labelKey: 'cash', icon: Wallet, capability: 'cashbox.view' },
    ],
  },

  // 3. Ombor
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
        to: '/inventory/transfers',
        labelKey: 'transfers',
        icon: ArrowRightLeft,
        capability: TRANSFER_VIEW_CAPS,
        badge: 'incomingTransfers',
      },
      {
        to: '/inventory/counts',
        labelKey: 'counts',
        icon: ClipboardCheck,
        capability: ['inventory.counts.manage', 'inventory.view_cost'],
      },
      {
        to: '/inventory/write-offs',
        labelKey: 'writeOffs',
        icon: PackageX,
        capability: ['inventory.writeoffs.manage', 'inventory.view_cost'],
      },
    ],
  },

  // 4. Dastavchiklar — alohida bo'lim: yetkazib beruvchilar, kirimlar, xarajatlar
  {
    labelKey: 'suppliersGroup',
    icon: Truck,
    children: [
      {
        to: '/purchasing/suppliers',
        labelKey: 'suppliers',
        icon: Truck,
        capability: 'purchasing.view',
      },
      {
        to: '/purchasing/purchases',
        labelKey: 'purchases',
        icon: ClipboardList,
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

  // Buyurtma jarayoni: omborchi → operator → kuryer (telefonda ham qulay)
  {
    labelKey: 'fulfillmentGroup',
    icon: Truck,
    children: [
      {
        to: '/fulfillment',
        labelKey: 'fulfillment',
        icon: PackageCheck,
        capability: FULFILLMENT_VIEW_CAPS,
      },
    ],
  },

  // 5. Katalog
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

  // 6. Xodimlar (HR) — alohida bo'lim
  {
    labelKey: 'hr',
    icon: Briefcase,
    children: [
      { to: '/hr', labelKey: 'employees', icon: Users, capability: HR_VIEW_CAPS },
      { to: '/hr/departments', labelKey: 'departments', icon: Building, capability: HR_VIEW_CAPS },
      { to: '/payroll', labelKey: 'payroll', icon: Coins, capability: PAYROLL_VIEW_CAPS },
    ],
  },

  // 7. Moliya va buxgalteriya
  {
    labelKey: 'finance',
    icon: Landmark,
    children: [
      {
        to: '/accounting',
        labelKey: 'accounts',
        icon: BookOpen,
        capability: ACCOUNTING_VIEW_CAPS,
      },
      {
        to: '/accounting/journal',
        labelKey: 'journal',
        icon: NotebookPen,
        capability: ACCOUNTING_VIEW_CAPS,
      },
      {
        to: '/accounting/trial-balance',
        labelKey: 'trialBalance',
        icon: ClipboardCheck,
        capability: ACCOUNTING_VIEW_CAPS,
      },
      {
        to: '/accounting/fiscal-years',
        labelKey: 'fiscalYears',
        icon: CalendarRange,
        capability: ACCOUNTING_VIEW_CAPS,
      },
      {
        to: '/reports',
        labelKey: 'reports',
        icon: FileBarChart,
        capability: ['reports.view', 'reports.financial'],
      },
    ],
  },

  // 8. Sotuv va ishlab chiqarish (kengaytirilgan modullar)
  {
    labelKey: 'growth',
    icon: Target,
    children: [
      { to: '/crm', labelKey: 'leads', icon: Megaphone, capability: CRM_VIEW_CAPS },
      { to: '/crm/deals', labelKey: 'deals', icon: Target, capability: CRM_VIEW_CAPS },
      {
        to: '/crm/activities',
        labelKey: 'activities',
        icon: ListChecks,
        capability: CRM_VIEW_CAPS,
      },
      {
        to: '/manufacturing',
        labelKey: 'boms',
        icon: Factory,
        capability: MANUFACTURING_VIEW_CAPS,
      },
      {
        to: '/manufacturing/orders',
        labelKey: 'productionOrders',
        icon: Factory,
        capability: MANUFACTURING_VIEW_CAPS,
      },
    ],
  },

  // 9. Sozlamalar (faqat admin)
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
        to: '/settings/payment-methods',
        labelKey: 'paymentMethods',
        icon: CreditCard,
        capability: 'settings.manage',
      },
      {
        to: '/settings/write-off-reasons',
        labelKey: 'writeOffReasons',
        icon: ListX,
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

  // 10. Nazorat va xavfsizlik
  { to: '/workflow', labelKey: 'workflow', icon: CalendarCheck, badge: 'approvalsAssigned' },
  { to: '/audit', labelKey: 'audit', icon: ScrollText, capability: 'audit.view' },
  { to: '/security/logins', labelKey: 'loginHistory', icon: History, capability: 'users.manage' },
  {
    to: '/notifications',
    labelKey: 'notifications',
    icon: BadgeCheck,
    capability: 'settings.manage',
  },
]

export function hasCapability(
  capabilities: readonly string[],
  required: string | readonly string[] | undefined,
): boolean {
  if (!required) return true
  if (typeof required === 'string') return capabilities.includes(required)
  return required.some((c) => capabilities.includes(c))
}

export function filterNav(items: NavItem[], capabilities: readonly string[]): NavItem[] {
  return items.flatMap((item) => {
    if (!hasCapability(capabilities, item.capability)) return []
    if (item.children) {
      const children = filterNav(item.children, capabilities)
      return children.length ? [{ ...item, children }] : []
    }
    return [item]
  })
}

/**
 * Faol menyu bandi — eng uzun mos keladigan yo'l. Shunda /sales/pos da faqat "Kassa" faol
 * bo'ladi ("Savdolar" (/sales) emas), /sales/12 da esa "Savdolar".
 */
export function activeNavPath(pathname: string, items: NavItem[]): string | null {
  let best: string | null = null
  const visit = (list: NavItem[]) => {
    for (const item of list) {
      if (item.children) visit(item.children)
      const to = item.to
      if (!to) continue
      if (
        (pathname === to || pathname.startsWith(`${to}/`)) &&
        (!best || to.length > best.length)
      ) {
        best = to
      }
    }
  }
  visit(items)
  return best
}
