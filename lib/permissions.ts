import type { User } from "./auth"

export type Permission =
  | "news:create"
  | "news:edit"
  | "news:delete"
  | "news:view"
  | "users:create"
  | "users:edit:all"
  | "users:edit:own"
  | "users:delete"
  | "users:view:all"
  | "users:view:own"

export type Role = "super_admin" | "user"

const rolePermissions: Record<Role, Permission[]> = {
  super_admin: [
    "news:create",
    "news:edit",
    "news:delete",
    "news:view",
    "users:create",
    "users:edit:all",
    "users:edit:own",
    "users:delete",
    "users:view:all",
    "users:view:own",
  ],
  user: ["news:view", "users:edit:own", "users:view:own"],
}

export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false
  return rolePermissions[user.role]?.includes(permission) ?? false
}

export function canEditUser(currentUser: User | null, targetUser: User): boolean {
  if (!currentUser) return false

  // Super admin can edit anyone
  if (hasPermission(currentUser, "users:edit:all")) return true

  // Users can edit themselves
  if (hasPermission(currentUser, "users:edit:own") && currentUser.id === targetUser.id) return true

  return false
}

export function canViewUser(currentUser: User | null, targetUser: User): boolean {
  if (!currentUser) return false

  // Super admin can view anyone
  if (hasPermission(currentUser, "users:view:all")) return true

  // Users can view themselves
  if (hasPermission(currentUser, "users:view:own") && currentUser.id === targetUser.id) return true

  return false
}

export function canDeleteUser(currentUser: User | null, targetUser: User): boolean {
  if (!currentUser) return false

  // Can't delete yourself
  if (currentUser.id === targetUser.id) return false

  // Only super admin can delete users
  return hasPermission(currentUser, "users:delete")
}

export function getAccessibleUsers(currentUser: User | null, allUsers: User[]): User[] {
  if (!currentUser) return []

  // Super admin can see all users
  if (hasPermission(currentUser, "users:view:all")) return allUsers

  // Regular users can only see themselves
  return allUsers.filter((user) => user.id === currentUser.id)
}
