import { useTranslation } from 'react-i18next'
import { Link, useRouteError } from 'react-router'

import { Button } from '@/shared/ui'

function StatusPage({ code, title, text }: { code: string; title: string; text: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-slate-200">{code}</p>
      <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
      <Link to="/" className="mt-6">
        <Button variant="secondary">{t('pages.home')}</Button>
      </Link>
    </div>
  )
}

export function ForbiddenPage() {
  const { t } = useTranslation()
  return (
    <StatusPage code="403" title={t('pages.forbidden.title')} text={t('pages.forbidden.text')} />
  )
}

export function NotFoundPage() {
  const { t } = useTranslation()
  return <StatusPage code="404" title={t('pages.notFound.title')} text={t('pages.notFound.text')} />
}

export function ErrorPage() {
  const { t } = useTranslation()
  const error = useRouteError()
  const message = error instanceof Error ? error.message : String(error)
  return <StatusPage code="!" title={t('status.error')} text={message} />
}
