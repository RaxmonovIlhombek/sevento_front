import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

import { isApiError } from '@/shared/api/errors'
import { z } from '@/shared/forms/zod'
import { Button, FormField, Input } from '@/shared/ui'

import { useAuthStore } from '../store/authStore'

const schema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
})
type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [retryAfter, setRetryAfter] = useState(0)

  useEffect(() => {
    if (retryAfter <= 0) return
    const id = window.setInterval(() => {
      setRetryAfter((v) => (v > 1 ? v - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [retryAfter])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    if (retryAfter > 0) return
    setServerError(null)
    try {
      await login(values.username, values.password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from !== '/login' ? from : '/', { replace: true })
    } catch (error) {
      if (isApiError(error) && error.code === 'account_locked') {
        setRetryAfter(error.retryAfter ?? 300)
        return
      }
      setServerError(
        isApiError(error) && error.code === 'authentication_failed'
          ? t('login.failed')
          : isApiError(error)
            ? error.message
            : String(error),
      )
    }
  }

  const locked = retryAfter > 0

  function formatSeconds(s: number): string {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-700 to-cyan-600 px-4 py-10">
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-brand-300/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/15 text-3xl font-extrabold text-white shadow-lg ring-1 ring-white/25 backdrop-blur">
            S
          </div>
          <h1 className="text-2xl font-bold text-white">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-emerald-100/90">{t('login.subtitle')}</p>
        </div>

        <div className="rounded-2xl bg-white/95 p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              label={t('login.username')}
              htmlFor="username"
              error={errors.username?.message}
            >
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon className="size-4" />
                </span>
                <Input
                  id="username"
                  autoComplete="username"
                  autoFocus
                  disabled={locked}
                  invalid={!!errors.username}
                  className="pl-9"
                  {...register('username')}
                />
              </div>
            </FormField>

            <FormField
              label={t('login.password')}
              htmlFor="password"
              error={errors.password?.message}
            >
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="size-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={locked}
                  invalid={!!errors.password}
                  className="pl-9 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </FormField>

            {locked && (
              <div
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800"
                role="alert"
              >
                <span>Hisob vaqtincha qulflangan</span>
                <span className="font-mono font-semibold">{formatSeconds(retryAfter)}</span>
              </div>
            )}

            {!locked && serverError && (
              <div
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                role="alert"
              >
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-red-500" />
                <span>{serverError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-base font-semibold shadow-md hover:bg-emerald-700"
              loading={isSubmitting}
              disabled={locked}
            >
              {t('login.submit')}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-emerald-100/70">
          © {new Date().getFullYear()} Sevento
        </p>
      </div>
    </div>
  )
}
