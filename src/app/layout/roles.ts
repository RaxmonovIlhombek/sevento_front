/**
 * Rol shablonlari — backend `apps/accounts/capabilities.py` dagi ROLE_PRESETS ning aynan nusxasi.
 * Haqiqiy huquqlar backendda saqlanadi va majburan tekshiriladi; bu fayl UI uchun
 * (rol tavsifi, bosh sahifa) ishlatiladi. Backend o'zgarsa, shu faylni ham yangilang.
 *
 * Ma'lumot doirasi: `branches.view_all` bor rol — barcha nuqtalar, yo'q bo'lsa faqat
 * foydalanuvchiga biriktirilgan nuqtalar (backend `accessible_branch_ids`).
 */

export interface RolePreset {
  code: string
  name: string
  description: string
  /** Shu rol kirganda ochiladigan sahifa */
  home: string
  /** all — barcha nuqtalar, branch — faqat biriktirilgan nuqtalar */
  scope: 'all' | 'branch'
  capabilities: readonly string[]
}

export const ROLE_PRESETS: readonly RolePreset[] = [
  {
    code: 'owner',
    name: 'Rahbar',
    description: 'Barcha nuqtalar, barcha modullar, foydalanuvchilar va tizim sozlamalari.',
    home: '/dashboard',
    scope: 'all',
    capabilities: [
      'accounting.manage',
      'accounting.view',
      'audit.view',
      'branches.manage',
      'branches.view_all',
      'cashbox.manage',
      'cashbox.view',
      'catalog.manage',
      'catalog.prices.manage',
      'catalog.view',
      'crm.manage',
      'crm.view',
      'currency.rates.manage',
      'customers.credit_limit.manage',
      'customers.manage',
      'customers.view',
      'dashboard.view',
      'debts.manage',
      'debts.view',
      'deliveries.manage',
      'deliveries.view',
      'hr.manage',
      'hr.view',
      'inventory.counts.manage',
      'inventory.manage',
      'inventory.transfers.cancel',
      'inventory.transfers.create',
      'inventory.transfers.receive',
      'inventory.view',
      'inventory.view_cost',
      'inventory.writeoffs.manage',
      'manufacturing.manage',
      'manufacturing.view',
      'payments.receive',
      'payments.refund',
      'payments.view',
      'payroll.manage',
      'payroll.view',
      'purchasing.manage',
      'purchasing.view',
      'reports.financial',
      'reports.view',
      'sales.cancel',
      'sales.create',
      'sales.credit',
      'sales.discount',
      'sales.discount.unlimited',
      'sales.returns.create',
      'sales.view',
      'settings.manage',
      'users.manage',
      'workflow.manage',
    ],
  },
  {
    code: 'branch_manager',
    name: 'Filial rahbari',
    description:
      "Faqat o'z filialining savdosi, xodimlari, mijozlari, qoldig'i va kassasi. Boshqa filiallar ko'rinmaydi.",
    home: '/dashboard',
    scope: 'branch',
    capabilities: [
      'cashbox.manage',
      'cashbox.view',
      'catalog.view',
      'customers.manage',
      'customers.view',
      'dashboard.view',
      'debts.view',
      'hr.view',
      'inventory.counts.manage',
      'inventory.transfers.create',
      'inventory.transfers.receive',
      'inventory.view',
      'inventory.writeoffs.manage',
      'payments.receive',
      'payments.view',
      'purchasing.view',
      'reports.view',
      'sales.create',
      'sales.credit',
      'sales.discount',
      'sales.returns.create',
      'sales.view',
    ],
  },
  {
    code: 'seller',
    name: 'Sotuvchi',
    description: "Kassa (POS), savdo va mijozlar. Faqat o'z nuqtasida.",
    home: '/sales/pos',
    scope: 'branch',
    capabilities: [
      'cashbox.view',
      'catalog.view',
      'customers.manage',
      'customers.view',
      'debts.view',
      'inventory.view',
      'payments.receive',
      'payments.view',
      'sales.create',
      'sales.credit',
      'sales.discount',
      'sales.returns.create',
      'sales.view',
    ],
  },
  {
    code: 'storekeeper',
    name: 'Omborchi',
    description: "Qoldiq, kirim, ko'chirish va inventarizatsiya. Faqat o'z nuqtasida.",
    home: '/inventory/stock',
    scope: 'branch',
    capabilities: [
      'catalog.manage',
      'catalog.view',
      'inventory.counts.manage',
      'inventory.manage',
      'inventory.transfers.cancel',
      'inventory.transfers.create',
      'inventory.transfers.receive',
      'inventory.view',
      'inventory.view_cost',
      'inventory.writeoffs.manage',
      'purchasing.manage',
      'purchasing.view',
      'reports.view',
    ],
  },
  {
    code: 'accountant',
    name: 'Buxgalter',
    description: "Qarzlar, to'lovlar, kassa, hisobotlar va buxgalteriya. Barcha nuqtalar.",
    home: '/debts',
    scope: 'all',
    capabilities: [
      'branches.view_all',
      'cashbox.manage',
      'cashbox.view',
      'catalog.prices.manage',
      'catalog.view',
      'currency.rates.manage',
      'customers.credit_limit.manage',
      'customers.manage',
      'customers.view',
      'dashboard.view',
      'debts.manage',
      'debts.view',
      'inventory.view',
      'inventory.view_cost',
      'payments.receive',
      'payments.refund',
      'payments.view',
      'purchasing.view',
      'reports.financial',
      'reports.view',
      'sales.view',
    ],
  },
  {
    code: 'hr_manager',
    name: "Kadrlar bo'limi (HR)",
    description:
      "Xodimlar, bo'limlar va ish haqi. Barcha nuqtalar xodimlari. Savdo va qoldiq ko'rinmaydi.",
    home: '/hr',
    scope: 'all',
    capabilities: ['branches.view_all', 'hr.manage', 'hr.view', 'payroll.manage', 'payroll.view'],
  },
  {
    code: 'courier',
    name: 'Dastavka (kuryer)',
    description:
      "Telefonda ishlaydi. Faqat o'ziga biriktirilgan yetkazishlar. Narx va qoldiq ko'rinmaydi.",
    home: '/deliveries',
    scope: 'branch',
    capabilities: ['deliveries.manage', 'deliveries.view'],
  },
] as const

/** Foydalanuvchi uchun bosh sahifa: rolning shabloni bo'lsa o'sha, aks holda dashboard. */
export function homeFor(roleCode: string | null | undefined): string {
  return ROLE_PRESETS.find((r) => r.code === roleCode)?.home ?? '/dashboard'
}
