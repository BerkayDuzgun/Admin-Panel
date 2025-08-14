"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { User } from "@/lib/auth"
import { useAuth } from "@/lib/auth"
import { canEditUser } from "@/lib/permissions"
import { ArrowLeft, Edit, Mail, Phone, UserIcon } from "lucide-react"

interface UserProfileProps {
  user: User
  onBack: () => void
  onEdit: () => void
}

export function UserProfile({ user, onBack, onEdit }: UserProfileProps) {
  const { user: currentUser } = useAuth()
  const canEdit = canEditUser(currentUser, user)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Button>
          <h1 className="text-3xl font-bold">{user.name}</h1>
        </div>
        {canEdit && (
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <Badge variant={user.role === "super_admin" ? "default" : "secondary"} className="w-fit mx-auto">
                {user.role === "super_admin" ? "Super Admin" : "User"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>@{user.username}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {user.biography && (
            <Card>
              <CardHeader>
                <CardTitle>Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{user.biography}</p>
              </CardContent>
            </Card>
          )}

          {user.aboutMe && (
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{user.aboutMe}</p>
              </CardContent>
            </Card>
          )}

          {user.experiences && user.experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.experiences.map((exp, index) => (
                  <div key={exp.id}>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{exp.position}</h4>
                          <p className="text-primary font-medium">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">{exp.duration}</p>
                        </div>
                      </div>
                      {exp.description && <p className="text-muted-foreground leading-relaxed">{exp.description}</p>}
                    </div>
                    {index < user.experiences!.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!user.biography && !user.aboutMe && (!user.experiences || user.experiences.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Profile information not available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {canEdit
                      ? "Edit this profile to add more information"
                      : "This user hasn't added profile information yet"}
                  </p>
                  {canEdit && (
                    <Button onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
