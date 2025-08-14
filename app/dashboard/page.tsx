"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Welcome, {user?.name}</h1>
            <p className="text-lg text-muted-foreground">Select an option from the sidebar to get started</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
