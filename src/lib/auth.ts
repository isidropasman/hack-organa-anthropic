export type UserRole = 'admin' | 'employee'

export interface CurrentUser {
  id: string
  name: string
  role: UserRole
  agentId?: string
}

const DEMO_ADMIN: CurrentUser = { id: 'admin-1', name: 'Martín García', role: 'admin' }
const DEMO_EMPLOYEE: CurrentUser = { id: 'emp-1', name: 'Carlos Méndez', role: 'employee', agentId: 'carlos-operations' }

export { DEMO_ADMIN, DEMO_EMPLOYEE }

const STORAGE_KEY = 'organa_current_user'

export function getCurrentUser(): CurrentUser {
  if (typeof window === 'undefined') return DEMO_ADMIN
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as CurrentUser
    } catch {
      // fall through
    }
  }
  return DEMO_ADMIN
}

export function setCurrentUser(user: CurrentUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function isAdmin(): boolean {
  return getCurrentUser().role === 'admin'
}
