/* eslint-disable react-refresh/only-export-components -- lazy sahifa konstantalari */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'

import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { PageSpinner } from '@/shared/ui'

import { AppShell } from '../layout/AppShell'
import { ErrorPage, ForbiddenPage, NotFoundPage } from '../pages/StatusPages'
import { RedirectIfAuthed, RequireAuth, RequireCapability } from './guards'

// Kam ishlatiladigan sahifalar alohida chunk larda (boshlang'ich yuklash kichik bo'lsin)
const settings = () => import('@/features/settings')
const UsersPage = lazy(() => settings().then((m) => ({ default: m.UsersPage })))
const UserFormPage = lazy(() => settings().then((m) => ({ default: m.UserFormPage })))
const RolesPage = lazy(() => settings().then((m) => ({ default: m.RolesPage })))
const RoleFormPage = lazy(() => settings().then((m) => ({ default: m.RoleFormPage })))
const BranchesPage = lazy(() => settings().then((m) => ({ default: m.BranchesPage })))
const SystemSettingsPage = lazy(() => settings().then((m) => ({ default: m.SystemSettingsPage })))
const AuditPage = lazy(() => import('@/features/audit').then((m) => ({ default: m.AuditPage })))

const guarded = (cap: string, element: ReactNode) => (
  <RequireCapability cap={cap}>
    <Suspense fallback={<PageSpinner />}>{element}</Suspense>
  </RequireCapability>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuthed>
        <LoginPage />
      </RedirectIfAuthed>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'settings',
        children: [
          { index: true, element: <Navigate to="/settings/users" replace /> },
          { path: 'users', element: guarded('users.manage', <UsersPage />) },
          { path: 'users/new', element: guarded('users.manage', <UserFormPage />) },
          { path: 'users/:id', element: guarded('users.manage', <UserFormPage />) },
          { path: 'roles', element: guarded('users.manage', <RolesPage />) },
          { path: 'roles/new', element: guarded('users.manage', <RoleFormPage />) },
          { path: 'roles/:id', element: guarded('users.manage', <RoleFormPage />) },
          {
            path: 'branches',
            element: (
              <Suspense fallback={<PageSpinner />}>
                <BranchesPage />
              </Suspense>
            ),
          },
          { path: 'system', element: guarded('settings.manage', <SystemSettingsPage />) },
        ],
      },
      { path: 'audit', element: guarded('audit.view', <AuditPage />) },
      { path: '403', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
