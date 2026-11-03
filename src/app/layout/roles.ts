/**
 * Rol shablonlari (UI uchun tavsiya). Haqiqiy huquqlar backendda saqlanadi;
 * bu fayl yangi rol yaratishda shablon sifatida va bosh sahifani tanlashda ishlatiladi.
 *
 * Ma'lumot doirasi (scope) backendda majburan tekshiriladi:
 *  - all_branches = true  → barcha nuqtalar (admin, bosh buxgalter)
 *  - all_branches = false → faqat user.branches ro'yxatidagi nuqtalar (filial rahbari, sotuvchi ...)
 */

export interface RolePreset {
  code: string
  name: string
  description: string
  /** Shu rol kirganda ochiladigan sahifa */
  home: string
  /** Ma'lumot doirasi: true bo'lsa barcha nuqtalar, aks holda faqat biriktirilgan nuqtalar */
  scope: 'all' | 'branch'
  capabilities: readonly string[]
}

const CASHIER = [
  'sales.view',
  'sales.create',
  'inventory.view',
  'customers.view',
  'cashbox.view',
  'payments.view',
] as const

export const ROLE_PRESETS: readonly RolePreset[] = [
  {
    code: 'admin',
    name: 'Bosh administrator',
    description:
      'Barcha nuqtalar, barcha modullar va foydalanuvchilar. Tizim sozlamalari shu rolda.',
    home: '/dashboard',
    scope: 'all',
    capabilities: ['*'],
  },
  {
    code: 'branch_manager',
    name: 'Filial rahbari',
    description:
      "Faqat o'z filialining savdosi, xodimlari, mijozlari, qoldig'i va kassasi. Boshqa filiallar ko'rinmaydi.",
    home: '/dashboard',
    scope: 'branch',
    capabilities: [
      ...CASHIER,
      'dashboard.view',
      'reports.view',
      'debts.view',
      'catalog.view',
      'purchasing.view',
      'inventory.counts.manage',
      'inventory.transfers.create',
      'inventory.transfers.receive',
      'inventory.writeoffs.manage',
      'hr.view',
      'workflow.approve',
    ],
  },
  {
    code: 'cashier',
    name: 'Sotuvchi / kassir',
    description: "Kassa (POS), savdo va qaytarish. Faqat o'z nuqtasida.",
    home: '/sales/pos',
    scope: 'branch',
    capabilities: [...CASHIER, 'sales.returns'],
  },
  {
    code: 'warehouse',
    name: 'Omborchi',
    description: "Qoldiq, kirim, ko'chirish va inventarizatsiya. Narx ko'rinmaydi.",
    home: '/inventory/stock',
    scope: 'branch',
    capabilities: [
      'inventory.view',
      'purchasing.view',
      'purchasing.manage',
      'inventory.transfers.create',
      'inventory.transfers.receive',
      'inventory.counts.manage',
      'catalog.view',
    ],
  },
  {
    code: 'accountant',
    name: 'Buxgalter',
    description: "Mijozlar qarzi, to'lovlar, kassa, hisobotlar va buxgalteriya jurnali.",
    home: '/debts',
    scope: 'all',
    capabilities: [
      'customers.view',
      'debts.view',
      'payments.view',
      'cashbox.view',
      'reports.view',
      'reports.financial',
      'inventory.view_cost',
      'accounting.view',
    ],
  },
  {
    code: 'supplier_manager',
    name: 'Dastavchiklar menejeri',
    description:
      "Yetkazib beruvchilar bilan ishlash: kirimlar, xarajat turlari, narxlar. Savdo va mijozlar ko'rinmaydi.",
    home: '/purchasing/suppliers',
    scope: 'all',
    capabilities: [
      'purchasing.view',
      'purchasing.manage',
      'catalog.view',
      'inventory.view',
      'inventory.view_cost',
    ],
  },
  {
    code: 'hr_manager',
    name: 'Kadrlar bo‘limi (HR)',
    description: "Xodimlar, bo'limlar, lavozimlar va ish haqi. Savdo va qoldiq ko'rinmaydi.",
    home: '/hr',
    scope: 'all',
    capabilities: ['hr.view', 'hr.manage', 'payroll.view', 'payroll.manage', 'users.view'],
  },
] as const

/** Foydalanuvchi uchun bosh sahifa: rolning shabloni bo'lsa o'sha, aks holda dashboard. */
export function homeFor(roleCode: string | null | undefined): string {
  return ROLE_PRESETS.find((r) => r.code === roleCode)?.home ?? '/dashboard'
}
