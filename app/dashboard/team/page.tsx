"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/permission-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllUsers, deleteUser, type User } from "@/lib/auth"
import { useAuth } from "@/lib/auth"
import { getAccessibleUsers, canEditUser, canDeleteUser, hasPermission } from "@/lib/permissions"
import { UserEditor } from "@/components/user-editor"
import { UserProfile } from "@/components/user-profile"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, UserIcon, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showUserEditor, setShowUserEditor] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "profile">("list")
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const allUsers = getAllUsers()
    const accessibleUsers = getAccessibleUsers(currentUser, allUsers)
    setUsers(accessibleUsers)
  }, [currentUser])

  const handleDelete = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId)
    if (!targetUser) return

    if (!canDeleteUser(currentUser, targetUser)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete this user",
        variant: "destructive",
      })
      return
    }

    if (deleteUser(userId)) {
      const allUsers = getAllUsers()
      const accessibleUsers = getAccessibleUsers(currentUser, allUsers)
      setUsers(accessibleUsers)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    }
  }

  const handleCreateUser = () => {
    if (!hasPermission(currentUser, "users:create")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create users",
        variant: "destructive",
      })
      return
    }

    setSelectedUser(null)
    setShowUserEditor(true)
  }

  const handleViewProfile = (user: User) => {
    setSelectedUser(user)
    setViewMode("profile")
  }

  const handleEditProfile = (user: User) => {
    if (!canEditUser(currentUser, user)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this user",
        variant: "destructive",
      })
      return
    }

    setSelectedUser(user)
    setShowUserEditor(true)
  }

  const handleSave = () => {
    const allUsers = getAllUsers()
    const accessibleUsers = getAccessibleUsers(currentUser, allUsers)
    setUsers(accessibleUsers)
    setShowUserEditor(false)
    setSelectedUser(null)
  }

  const handleCancel = () => {
    setShowUserEditor(false)
    setSelectedUser(null)
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedUser(null)
  }

  // Show user editor
  if (showUserEditor) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <UserEditor user={selectedUser} onSave={handleSave} onCancel={handleCancel} />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  // Show user profile
  if (viewMode === "profile" && selectedUser) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <UserProfile user={selectedUser} onBack={handleBackToList} onEdit={() => handleEditProfile(selectedUser)} />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!hasPermission(currentUser, "users:view:own") && !hasPermission(currentUser, "users:view:all")) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Alert className="max-w-md">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to view team management. Contact your administrator for access.
              </AlertDescription>
            </Alert>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Team Management</h1>
            <PermissionGuard permission="users:create">
              <Button onClick={handleCreateUser}>
                <Plus className="mr-2 h-4 w-4" />
                Create New User
              </Button>
            </PermissionGuard>
          </div>

          {users.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No team members found</h3>
                  <PermissionGuard permission="users:create">
                    <p className="text-sm text-muted-foreground mb-4">Create your first team member to get started</p>
                    <Button onClick={handleCreateUser}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New User
                    </Button>
                  </PermissionGuard>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{user.name}</CardTitle>
                        <CardDescription className="truncate">{user.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                        {user.role === "super_admin" ? "Super Admin" : "User"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {user.biography && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{user.biography}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewProfile(user)} className="flex-1">
                        View Profile
                      </Button>
                      {canEditUser(currentUser, user) && (
                        <Button variant="outline" size="sm" onClick={() => handleEditProfile(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteUser(currentUser, user) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(user.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
