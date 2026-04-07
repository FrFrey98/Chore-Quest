import type { Role } from '@/generated/prisma/enums'

export type Permission =
  | 'manageUsers'
  | 'editSettings'
  | 'manageStore'
  | 'manageAchievements'
  | 'manageCategories'
  | 'createTasks'
  | 'approveTasks'
  | 'completeTasks'
  | 'useStore'
  | 'viewAllProfiles'

export interface NavItem {
  href: string
  label: string
  icon: string
  minPermission?: Permission
  minRole?: Role[]
}

const PERMISSION_MAP: Record<Role, Set<Permission>> = {
  admin: new Set([
    'manageUsers', 'editSettings', 'manageStore', 'manageAchievements',
    'manageCategories', 'createTasks', 'approveTasks', 'completeTasks',
    'useStore', 'viewAllProfiles',
  ]),
  member: new Set([
    'createTasks', 'approveTasks', 'completeTasks', 'useStore', 'viewAllProfiles',
  ]),
  child: new Set([
    'completeTasks', 'useStore', 'viewAllProfiles',
  ]),
}

const ALL_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: 'Home' },
  { href: '/tasks', label: 'Aufgaben', icon: 'CheckSquare' },
  { href: '/approvals', label: 'Freigaben', icon: 'ClipboardCheck', minPermission: 'approveTasks' },
  { href: '/store', label: 'Store', icon: 'ShoppingBag' },
  { href: '/achievements', label: 'Erfolge', icon: 'Trophy' },
  { href: '/manage', label: 'Verwalten', icon: 'ListTodo', minPermission: 'createTasks' },
  { href: '/settings', label: 'Einstellungen', icon: 'Settings', minRole: ['admin'] },
  { href: '/profile', label: 'Profil', icon: 'User' },
]

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSION_MAP[role]?.has(permission) ?? false
}

export function requirePermission(
  role: Role | undefined,
  permission: Permission,
): { error: string; status: number } | null {
  if (!role || !hasPermission(role, permission)) {
    return { error: 'Keine Berechtigung', status: 403 }
  }
  return null
}

export function requireRole(
  role: Role | undefined,
  ...allowed: Role[]
): { error: string; status: number } | null {
  if (!role || !allowed.includes(role)) {
    return { error: 'Keine Berechtigung', status: 403 }
  }
  return null
}

export function getVisibleNavItems(role: Role): NavItem[] {
  return ALL_NAV_ITEMS.filter((item) => {
    if (item.minRole && !item.minRole.includes(role)) {
      return false
    }
    if (item.minPermission && !hasPermission(role, item.minPermission)) {
      return false
    }
    return true
  })
}
