/**
 * O'zbekiston telefon raqamlari uchun formatlash funksiyasi.
 * Doimo "+998 " bilan boshlanadi, harflarni kiritishga yo'l qo'ymaydi,
 * faqat raqamlar qabul qilinadi va "+998 (90) 123-45-67" formatida chiroyli ko'rsatiladi.
 */
export function formatUzPhone(input: string): string {
  if (!input) return '+998 '
  // Barcha no-raqamlarni tozalaymiz
  let digits = input.replace(/\D/g, '')

  // Agar 998 bilan boshlangan bo'lsa uni olib tashlaymiz
  if (digits.startsWith('998')) {
    digits = digits.slice(3)
  }

  // Maksimal 9 ta raqam (operator kodi + 7 xonali raqam)
  digits = digits.slice(0, 9)

  let formatted = '+998'
  if (digits.length > 0) {
    formatted += ' (' + digits.slice(0, 2)
  }
  if (digits.length >= 2) {
    formatted += ') ' + digits.slice(2, 5)
  }
  if (digits.length >= 5) {
    formatted += '-' + digits.slice(5, 7)
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(7, 9)
  }

  return formatted
}

