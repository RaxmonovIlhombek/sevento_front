import { use2FAStatus } from '../api/security.api'

export function TwoFactorPage() {
  const { data, isPending } = use2FAStatus()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ikki bosqichli autentifikatsiya (2FA)</h1>
      {isPending && <p>Yuklanmoqda...</p>}
      <p>Holat: {data?.enabled ? 'Yoqilgan' : "O'chirilgan"}</p>
      <p className="text-sm text-gray-500 mt-2">Sozlash uchun Swagger/API orqali `/security/2fa/setup/` chaqiring.</p>
    </div>
  )
}
