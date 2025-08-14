"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PermissionGuard } from "@/components/permission-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getAllNews, deleteNews, type NewsPost } from "@/lib/news"
import { useAuth } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { NewsEditor } from "@/components/news-editor"
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
import { Edit, Trash2, Plus, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewsPage() {
  const [news, setNews] = useState<NewsPost[]>([])
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setNews(getAllNews())
  }, [])

  const handleDelete = (id: string) => {
    if (!hasPermission(user, "news:delete")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete news posts",
        variant: "destructive",
      })
      return
    }

    if (deleteNews(id)) {
      setNews(getAllNews())
      toast({
        title: "Success",
        description: "News post deleted successfully",
      })
    }
  }

  const handleEdit = (post: NewsPost) => {
    if (!hasPermission(user, "news:edit")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit news posts",
        variant: "destructive",
      })
      return
    }

    setEditingPost(post)
    setShowEditor(true)
  }

  const handleCreate = () => {
    if (!hasPermission(user, "news:create")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create news posts",
        variant: "destructive",
      })
      return
    }

    setEditingPost(null)
    setShowEditor(true)
  }

  const handleSave = () => {
    setNews(getAllNews())
    setShowEditor(false)
    setEditingPost(null)
  }

  const handleCancel = () => {
    setShowEditor(false)
    setEditingPost(null)
  }

  if (showEditor) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <NewsEditor post={editingPost} onSave={handleSave} onCancel={handleCancel} />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!hasPermission(user, "news:view")) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Alert className="max-w-md">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to view news management. Contact your administrator for access.
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
            <h1 className="text-3xl font-bold">News Management</h1>
            <PermissionGuard permission="news:create">
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Post
              </Button>
            </PermissionGuard>
          </div>

          {news.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No news posts yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first news post to get started</p>
                  <PermissionGuard permission="news:create">
                    <Button onClick={handleCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Post
                    </Button>
                  </PermissionGuard>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {news.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <CardDescription>{post.excerpt}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By {post.author}</span>
                          <span>•</span>
                          <span>{post.publishedAt.toLocaleDateString()}</span>
                          <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PermissionGuard permission="news:edit">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="news:delete">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete News Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(post.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardHeader>
                  {post.bannerImage && (
                    <CardContent>
                      <img
                        src={post.bannerImage || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
