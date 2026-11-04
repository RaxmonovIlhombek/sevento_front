import { describe, expect, it } from 'vitest'

import { activeNavPath, filterNav, navItems } from './nav'

const paths = (caps: string[]) =>
  filterNav(navItems, caps).flatMap((i) => (i.children ? i.children.map((c) => c.to) : [i.to]))

describe('filterNav', () => {
  it("omborchi kirim, qoldiq va harakatlarni ko'radi, sozlamalarni ko'rmaydi", () => {
    const visible = paths([
      'inventory.view',
      'purchasing.view',
      'purchasing.manage',
      'catalog.view',
    ])
    expect(visible).toEqual(
      expect.arrayContaining([
        '/inventory/stock',
        '/inventory/movements',
        '/purchasing/purchases',
        '/purchasing/suppliers',
        '/purchasing/expense-types',
      ]),
    )
    expect(visible).not.toContain('/settings/users')
  })

  it("kirim huquqisiz foydalanuvchida xarajat turlari yo'q", () => {
    const visible = paths(['inventory.view', 'purchasing.view'])
    expect(visible).toContain('/purchasing/purchases')
    expect(visible).not.toContain('/purchasing/expense-types')
  })

  it("huquqi yo'q guruh butunlay yashiriladi", () => {
    const groups = filterNav(navItems, []).map((i) => i.labelKey)
    expect(groups).not.toContain('inventory')
  })
})

describe('activeNavPath', () => {
  it("eng uzun mos yo'l faol: /sales/pos — Kassa, /sales/12 — Savdolar", () => {
    expect(activeNavPath('/sales/pos', navItems)).toBe('/sales/pos')
    expect(activeNavPath('/sales/12', navItems)).toBe('/sales')
    expect(activeNavPath('/catalog/products/5', navItems)).toBe('/catalog/products')
    expect(activeNavPath('/salesman', navItems)).toBeNull()
  })
})

describe("to'lovlar menyusi", () => {
  it("buxgalter mijozlar, qarzlar, to'lovlar va kassani ko'radi; omborchi ko'rmaydi", () => {
    const accountant = paths(['customers.view', 'debts.view', 'payments.view', 'cashbox.view'])
    expect(accountant).toEqual(
      expect.arrayContaining(['/customers', '/debts', '/payments', '/cash']),
    )
    expect(paths(['inventory.view', 'purchasing.view'])).not.toContain('/customers')
  })
})

describe('ombor hujjatlari va qaytarish menyusi', () => {
  it("ro'yxatdagi huquqlardan birortasi yetarli (ko'chirish: yaratish, qabul yoki tannarx)", () => {
    expect(paths(['inventory.transfers.receive'])).toContain('/inventory/transfers')
    expect(paths(['inventory.view_cost'])).toEqual(
      expect.arrayContaining([
        '/inventory/transfers',
        '/inventory/counts',
        '/inventory/write-offs',
      ]),
    )
    // sotuvchi: qoldiq bor, ko'chirish/inventarizatsiya yo'q; qaytarishlar — savdo bo'limida
    const seller = paths(['inventory.view', 'sales.view', 'sales.create'])
    expect(seller).not.toContain('/inventory/transfers')
    expect(seller).not.toContain('/inventory/counts')
    expect(seller).toContain('/sales/returns')
  })

  it('/sales/returns/5 da faqat "Qaytarishlar" faol', () => {
    expect(activeNavPath('/sales/returns/5', navItems)).toBe('/sales/returns')
    expect(activeNavPath('/inventory/transfers/new', navItems)).toBe('/inventory/transfers')
  })
})

describe("Xodimlar, dastavchiklar va moliya bo'limlari", () => {
  it("HR bo'limi faqat HR huquqi bilan ko'rinadi, savdoga aralashmaydi", () => {
    const hr = paths(['hr.view'])
    expect(hr).toEqual(expect.arrayContaining(['/hr', '/hr/departments']))
    expect(hr).not.toContain('/sales/pos')
    expect(hr).not.toContain('/inventory/stock')
  })

  it("dastavchiklar menejeri o'z bo'limini ko'radi, mijozlar va savdo ko'rinmaydi", () => {
    const sup = paths(['purchasing.view', 'purchasing.manage'])
    expect(sup).toEqual(
      expect.arrayContaining([
        '/purchasing/suppliers',
        '/purchasing/purchases',
        '/purchasing/expense-types',
      ]),
    )
    expect(sup).not.toContain('/customers')
    expect(sup).not.toContain('/sales')
  })

  it("moliya bo'limi buxgalterga ochiq, omborchiga yopiq", () => {
    expect(paths(['accounting.view'])).toEqual(
      expect.arrayContaining(['/accounting', '/accounting/journal', '/accounting/trial-balance']),
    )
    expect(paths(['inventory.view'])).not.toContain('/accounting')
  })

  it("settings.manage yolg'iz HR, buxgalteriya va CRM ni ochmaydi (backend ham rad etadi)", () => {
    const admin = paths(['settings.manage'])
    expect(admin).not.toContain('/hr')
    expect(admin).not.toContain('/accounting')
    expect(admin).not.toContain('/crm')
  })
})

describe('rol shablonlari', () => {
  it("kuryer telefonda faqat yetkazishlarni ko'radi, savdo va qoldiq ko'rinmaydi", () => {
    const courier = paths(['deliveries.view', 'deliveries.manage'])
    expect(courier).toContain('/deliveries')
    expect(courier).not.toContain('/sales/pos')
    expect(courier).not.toContain('/inventory/stock')
    expect(courier).not.toContain('/hr')
    expect(courier).not.toContain('/accounting')
    expect(courier).not.toContain('/settings/users')
  })

  it("HR roli alohida: savdo, qoldiq yoki dastavka ko'rinmaydi", () => {
    const hr = paths(['hr.view', 'hr.manage', 'payroll.view'])
    expect(hr).toEqual(expect.arrayContaining(['/hr', '/payroll']))
    expect(hr).not.toContain('/deliveries')
    expect(hr).not.toContain('/sales/pos')
  })
})
