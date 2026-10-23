/**
 * PDF ni chop etish: yashirin iframe ga blob URL yuklanadi va brauzer chop etish oynasi ochiladi.
 * Token URL ga yozilmaydi (fayl avval Authorization bilan olinadi). Iframe chop etolmasa
 * (masalan Safari) — yangi oynada ochiladi.
 */
export function printPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const frame = document.createElement('iframe')
  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '0'
  frame.style.height = '0'
  frame.style.border = '0'
  frame.setAttribute('aria-hidden', 'true')
  frame.dataset.testid = 'print-frame'
  frame.src = url
  const cleanup = () => {
    frame.remove()
    URL.revokeObjectURL(url)
  }
  frame.onload = () => {
    try {
      frame.contentWindow?.focus()
      frame.contentWindow?.print()
    } catch {
      window.open(url, '_blank', 'noopener')
    }
    // chop etish oynasi yopilgach ham PDF kerak bo'lishi mumkin — keyinroq tozalanadi
    setTimeout(cleanup, 60_000)
  }
  document.body.appendChild(frame)
}

export function openPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
