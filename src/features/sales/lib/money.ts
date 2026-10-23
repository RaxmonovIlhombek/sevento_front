/**
 * Kassa hisob-kitobi — serverdagi qoidalarning aniq nusxasi (apps/sales/pricing.py, services.py).
 * BigInt bilan: float xatosi yo'q, katta so'm summalarida ham aniq.
 *
 *   qator  = yaxlitlash_yarim_yuqoriga(miqdor × narx, valyuta xonasi) − chegirma
 *   to'lov = yaxlitlash(summa × kurs(to'lov) / kurs(savdo), 4 xona)
 *   qaytim = pastga_yaxlitlash(to'langan − jami, valyuta xonasi)
 *
 * Yakuniy summa baribir serverdan; bu — ekranda ko'rsatish va expected_total uchun.
 */
import { parseDecimalInput } from '@/shared/lib/money'

const TEN = 10n

function pow10(n: number): bigint {
  return TEN ** BigInt(n)
}

function divRoundHalfUp(n: bigint, d: bigint): bigint {
  if (n < 0n) return -divRoundHalfUp(-n, d)
  return (n * 2n + d) / (2n * d)
}

function divCeil(n: bigint, d: bigint): bigint {
  return n <= 0n ? n / d : (n + d - 1n) / d
}

/** "12 500,5" → 125005 (scale=1). Ortiqcha xonalar yarim yuqoriga yaxlitlanadi; xato → null. */
export function toScaled(value: string | number | null | undefined, scale: number): bigint | null {
  if (value === null || value === undefined) return null
  const text = parseDecimalInput(String(value))
  const match = /^(-?)(\d*)(?:\.(\d*))?$/.exec(text)
  if (!match || (match[2] === '' && (match[3] ?? '') === '')) return null
  const [, sign, int = '', frac = ''] = match
  let result: bigint
  if (frac.length <= scale) {
    result = BigInt((int || '0') + frac.padEnd(scale, '0'))
  } else {
    const digits = BigInt((int || '0') + frac)
    result = divRoundHalfUp(digits, pow10(frac.length - scale))
  }
  return sign === '-' ? -result : result
}

/** 125005n, scale 1 → "12500.5" (API ga yuborish uchun). */
export function fromScaled(value: bigint, scale: number): string {
  const negative = value < 0n
  const digits = (negative ? -value : value).toString().padStart(scale + 1, '0')
  const int = scale ? digits.slice(0, -scale) : digits
  const frac = scale ? digits.slice(-scale) : ''
  return `${negative ? '-' : ''}${int}${frac ? `.${frac}` : ''}`
}

export function lineGross(quantity: string, price: string, places: number): bigint | null {
  const q = toScaled(quantity, 3)
  const p = toScaled(price, places)
  if (q === null || p === null) return null
  return divRoundHalfUp(q * p, 1000n)
}

export interface LineInput {
  quantity: string
  price: string
  discount: string
}

export interface Totals {
  subtotal: bigint
  discount: bigint
  total: bigint
}

/** Barcha summalar savdo valyutasining eng kichik birligida (so'm, sent). */
export function cartTotals(lines: LineInput[], places: number): Totals {
  let subtotal = 0n
  let discount = 0n
  for (const line of lines) {
    subtotal += lineGross(line.quantity, line.price, places) ?? 0n
    discount += toScaled(line.discount || '0', places) ?? 0n
  }
  return { subtotal, discount, total: subtotal - discount }
}

/** To'lov summasi → savdo valyutasida, 4 xona (server bilan bir xil yaxlitlash). */
export function convertTo4(
  amount: string,
  rateFrom: string,
  rateTo: string,
  sameCurrency: boolean,
): bigint | null {
  const a = toScaled(amount, 4)
  if (a === null) return null
  if (sameCurrency) return a
  const rf = toScaled(rateFrom, 6)
  const rt = toScaled(rateTo, 6)
  if (rf === null || rt === null || rt === 0n) return null
  return divRoundHalfUp(a * rf, rt)
}

export interface PaymentState {
  paid4: bigint
  remaining4: bigint
  /** qaytim, savdo valyutasining eng kichik birligida */
  change: bigint
  /** ortiqcha summa naqd to'lovdan oshib ketdi (karta bilan ortiqcha to'lab bo'lmaydi) */
  changeNotCash: boolean
}

export function paymentState(
  totalMinor: bigint,
  places: number,
  paid4: bigint[],
  cashPaid4: bigint,
): PaymentState {
  const k = pow10(4 - places)
  const total4 = totalMinor * k
  const paid = paid4.reduce((a, b) => a + b, 0n)
  const over = paid - total4
  const change = over > 0n ? over / k : 0n
  return {
    paid4: paid,
    remaining4: over < 0n ? -over : 0n,
    change,
    changeNotCash: change * k > cashPaid4,
  }
}

/** Qolgan summani boshqa valyutada yopish uchun kerakli eng kichik summa (yuqoriga yaxlitlab). */
export function amountToCover(
  remaining4: bigint,
  payPlaces: number,
  rateFrom: string,
  rateTo: string,
  sameCurrency: boolean,
): string {
  if (remaining4 <= 0n) return '0'
  const unit = pow10(4 - payPlaces)
  if (sameCurrency) return fromScaled(divCeil(remaining4, unit), payPlaces)
  const rf = toScaled(rateFrom, 6)
  const rt = toScaled(rateTo, 6)
  if (rf === null || rt === null || rf === 0n) return '0'
  let minor = divCeil(divCeil(remaining4 * rt, rf), unit)
  // yaxlitlash tufayli kam chiqsa — bitta birlik qo'shiladi
  while ((convertTo4(fromScaled(minor, payPlaces), rateFrom, rateTo, false) ?? 0n) < remaining4) {
    minor += 1n
  }
  return fromScaled(minor, payPlaces)
}

/** BigInt eng kichik birlik → ko'rsatish uchun satr ("142500" yoki "11.40"). */
export function minorToString(value: bigint, places: number): string {
  return fromScaled(value, places)
}

/** 4 xonali summa → savdo valyutasining eng kichik birligi, yuqoriga (qolgan summani ko'rsatish). */
export function ceilToMinor(value4: bigint, places: number): bigint {
  return divCeil(value4, pow10(4 - places))
}
