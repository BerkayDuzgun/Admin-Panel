"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  username: string
  role: "super_admin" | "user"
  profilePicture?: string
  biography?: string
  aboutMe?: string
  experiences?: Experience[]
}

export interface Experience {
  id: string
  company: string
  position: string
  duration: string
  description: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database - in a real app, this would be in a database
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    name: "Super Administrator",
    email: "admin@company.com",
    phone: "+1 (555) 123-4567",
    username: "admin",
    password: "admin123",
    role: "super_admin",
    biography: "Experienced administrator with over 10 years in team management.",
    aboutMe: "Passionate about building great teams and delivering exceptional results.",
    experiences: [
      {
        id: "1",
        company: "Tech Corp",
        position: "Senior Manager",
        duration: "2020 - Present",
        description: "Leading cross-functional teams and driving strategic initiatives.",
      },
    ],
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("admin_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find((u) => u.username === username && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("admin_user", JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("admin_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper functions for user management
export function getAllUsers(): User[] {
  return mockUsers.map(({ password, ...user }) => user)
}

export function createUser(userData: Omit<User, "id"> & { password: string }): User {
  const newUser = {
    ...userData,
    id: Date.now().toString(),
  }
  mockUsers.push(newUser)
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export function updateUser(userId: string, updates: Partial<User>): User | null {
  const userIndex = mockUsers.findIndex((u) => u.id === userId)
  if (userIndex === -1) return null

  mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
  const { password, ...userWithoutPassword } = mockUsers[userIndex]
  return userWithoutPassword
}

export function deleteUser(userId: string): boolean {
  const userIndex = mockUsers.findIndex((u) => u.id === userId)
  if (userIndex === -1) return false

  mockUsers.splice(userIndex, 1)
  return true
}
