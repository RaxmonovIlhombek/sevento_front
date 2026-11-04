import { describe, expect, it } from 'vitest'

import { availableActions, defaultTab } from './actions'

const names = (
  status: Parameters<typeof availableActions>[0]['status'],
  caps: string[],
  id = 1,
  courier: number | null = null,
) => availableActions({ status, courier }, caps, id).map((a) => a.action)

describe('availableActions', () => {
  it('omborchi faqat kutayotgan buyurtmani taxlaydi', () => {
    expect(names('pending', ['fulfillment.pack'])).toEqual(['pack'])
    expect(names('packed', ['fulfillment.pack'])).toEqual([])
  })

  it('operator tayyor qiladi yoki sabab bilan qaytaradi', () => {
    expect(names('packed', ['fulfillment.verify'])).toEqual(['verify', 'reject'])
    expect(names('pending', ['fulfillment.verify'])).toEqual([])
  })

  it('kuryer tayyorni qabul qiladi, faqat o‘zinikini yetkazadi', () => {
    const caps = ['deliveries.manage']
    expect(names('ready', caps)).toEqual(['accept'])
    expect(names('on_the_way', caps, 7, 7)).toEqual(['deliver'])
    expect(names('on_the_way', caps, 7, 9)).toEqual([])
  })

  it('rahbar faqat bekor qiladi, jarayonni o‘zi bosib o‘tkazmaydi', () => {
    expect(names('pending', ['fulfillment.view', 'fulfillment.manage'])).toEqual(['cancel'])
    expect(names('delivered', ['fulfillment.manage'])).toEqual([])
  })
})

describe('defaultTab', () => {
  it('vazifaga qarab bosqich tanlanadi', () => {
    expect(defaultTab(['fulfillment.pack'])).toBe('pending')
    expect(defaultTab(['fulfillment.view', 'fulfillment.verify'])).toBe('packed')
    expect(defaultTab(['deliveries.view'])).toBe('ready')
    expect(defaultTab(['fulfillment.view', 'fulfillment.manage'])).toBe('all')
  })
})
