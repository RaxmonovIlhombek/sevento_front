/** Profil rasmi uchun: tanlangan faylni markazdan kvadrat qilib kesadi va JPEG data-URL ga aylantiradi. */

export const AVATAR_SIZE = 256
const MAX_INPUT_BYTES = 12 * 1024 * 1024
const MAX_OUTPUT_CHARS = 150_000

export class ImageError extends Error {
  constructor(readonly code: 'type' | 'size' | 'decode') {
    super(code)
  }
}

async function decode(file: File): Promise<{ source: CanvasImageSource; w: number; h: number }> {
  try {
    // EXIF yo'nalishi (telefon rasmi) hisobga olinadi
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return { source: bmp, w: bmp.width, h: bmp.height }
  } catch {
    return await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ source: img, w: img.naturalWidth, h: img.naturalHeight })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new ImageError('decode'))
      }
      img.src = url
    })
  }
}

export async function fileToAvatarDataUrl(file: File, size = AVATAR_SIZE): Promise<string> {
  if (!/^image\/(jpeg|png|webp|heic|heif|gif)$/i.test(file.type)) throw new ImageError('type')
  if (file.size > MAX_INPUT_BYTES) throw new ImageError('size')

  const { source, w, h } = await decode(file)
  if (!w || !h) throw new ImageError('decode')

  const side = Math.min(w, h)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageError('decode')
  ctx.fillStyle = '#ffffff' // shaffof PNG qora bo'lib qolmasin
  ctx.fillRect(0, 0, size, size)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size)

  for (const quality of [0.88, 0.78, 0.66, 0.5]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length <= MAX_OUTPUT_CHARS) return url
  }
  throw new ImageError('size')
}
