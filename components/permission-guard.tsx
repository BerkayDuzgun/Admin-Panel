"use client"

import type React from "react"
import { useAuth } from "@/lib/auth"
import { hasPermission, type Permission } from "@/lib/permissions"

interface PermissionGuardProps {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { user } = useAuth()

  if (!hasPermission(user, permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
