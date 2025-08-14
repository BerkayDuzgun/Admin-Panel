"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNews, updateNews, type NewsPost } from "@/lib/news"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Plus, X } from "lucide-react"

interface NewsEditorProps {
  post?: NewsPost | null
  onSave: () => void
  onCancel: () => void
}

export function NewsEditor({ post, onSave, onCancel }: NewsEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
      setExcerpt(post.excerpt)
      setBannerImage(post.bannerImage || "")
      setImages(post.images || [])
      setStatus(post.status)
    }
  }, [post])

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const newsData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 150) + "...",
        bannerImage: bannerImage.trim() || undefined,
        images: images.length > 0 ? images : undefined,
        author: user?.name || "Unknown",
        authorId: user?.id || "unknown",
        status,
      }

      if (post) {
        updateNews(post.id, newsData)
        toast({
          title: "Success",
          description: "News post updated successfully",
        })
      } else {
        createNews(newsData)
        toast({
          title: "Success",
          description: "News post created successfully",
        })
      }

      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save news post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to News
          </Button>
          <h1 className="text-3xl font-bold">{post ? "Edit Post" : "Create New Post"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(value: "draft" | "published") => setStatus(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description (optional - will auto-generate from content)"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  rows={12}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Banner Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banner">Image URL</Label>
                <Input
                  id="banner"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {bannerImage && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <img
                    src={bannerImage || "/placeholder.svg"}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="Image URL" />
                <Button type="button" onClick={handleAddImage} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((imageUrl, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Image ${index + 1}`}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="flex-1 text-sm truncate">{imageUrl}</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
