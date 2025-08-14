"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser, updateUser, type User, type Experience } from "@/lib/auth"
import { useAuth } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Plus, X } from "lucide-react"

interface UserEditorProps {
  user?: User | null
  onSave: () => void
  onCancel: () => void
}

export function UserEditor({ user, onSave, onCancel }: UserEditorProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"super_admin" | "user">("user")
  const [profilePicture, setProfilePicture] = useState("")
  const [biography, setBiography] = useState("")
  const [aboutMe, setAboutMe] = useState("")
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone || "")
      setUsername(user.username)
      setRole(user.role)
      setProfilePicture(user.profilePicture || "")
      setBiography(user.biography || "")
      setAboutMe(user.aboutMe || "")
      setExperiences(user.experiences || [])
    }
  }, [user])

  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      duration: "",
      description: "",
    }
    setExperiences([...experiences, newExperience])
  }

  const handleUpdateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = experiences.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    setExperiences(updated)
  }

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !username.trim()) {
      toast({
        title: "Error",
        description: "Name, email, and username are required",
        variant: "destructive",
      })
      return
    }

    if (!user && !password.trim()) {
      toast({
        title: "Error",
        description: "Password is required for new users",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        username: username.trim(),
        role,
        profilePicture: profilePicture.trim() || undefined,
        biography: biography.trim() || undefined,
        aboutMe: aboutMe.trim() || undefined,
        experiences: experiences.filter((exp) => exp.company.trim() || exp.position.trim()),
      }

      if (user) {
        updateUser(user.id, userData)
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        createUser({ ...userData, password: password.trim() })
        toast({
          title: "Success",
          description: "User created successfully",
        })
      }

      onSave()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isCreating = !user
  const canEditRole = currentUser?.role === "super_admin" && (!user || user.id !== currentUser.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Button>
          <h1 className="text-3xl font-bold">{isCreating ? "Create New User" : `Edit ${user.name}`}</h1>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save User"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                />
              </div>
              {isCreating && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}
              {canEditRole && (
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: "super_admin" | "user") => setRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture URL</Label>
                <Input
                  id="profilePicture"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                {profilePicture && (
                  <div className="mt-2">
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="biography">Biography</Label>
                <Textarea
                  id="biography"
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Brief professional biography"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutMe">About Me</Label>
                <Textarea
                  id="aboutMe"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Personal information and interests"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                <Button type="button" onClick={handleAddExperience} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiences.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No work experience added yet</p>
              ) : (
                experiences.map((exp, index) => (
                  <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveExperience(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => handleUpdateExperience(index, "position", e.target.value)}
                          placeholder="Job title"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Duration</Label>
                      <Input
                        value={exp.duration}
                        onChange={(e) => handleUpdateExperience(index, "duration", e.target.value)}
                        placeholder="e.g., 2020 - Present"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(index, "description", e.target.value)}
                        placeholder="Job responsibilities and achievements"
                        rows={2}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
