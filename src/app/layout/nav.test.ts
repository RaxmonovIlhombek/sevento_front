import { describe, expect, it } from 'vitest'

import { filterNav, navItems } from './nav'

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
