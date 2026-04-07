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
  labelKey: string
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
  { href: '/', labelKey: 'home', icon: 'Home' },
  { href: '/tasks', labelKey: 'tasks', icon: 'CheckSquare' },
  { href: '/store', labelKey: 'store', icon: 'ShoppingBag' },
  { href: '/achievements', labelKey: 'achievements', icon: 'Trophy' },
  { href: '/challenges', labelKey: 'challenges', icon: 'Swords', minPermission: 'completeTasks' },
  { href: '/profile', labelKey: 'profile', icon: 'User' },
]

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSION_MAP[role]?.has(permission) ?? false
}

export function requirePermission(
  role: Role | undefined,
  permission: Permission,
): { error: string; status: number } | null {
  if (!role || !hasPermission(role, permission)) {
    return { error: 'No permission', status: 403 }
  }
  return null
}

export function requireRole(
  role: Role | undefined,
  ...allowed: Role[]
): { error: string; status: number } | null {
  if (!role || !allowed.includes(role)) {
    return { error: 'No permission', status: 403 }
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
