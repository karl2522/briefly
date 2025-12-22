"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, type User } from "@/lib/api"
import { Camera, Check, Loader2, Mail, Pencil, User as UserIcon, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editedName, setEditedName] = useState("")
    const [editedAvatar, setEditedAvatar] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [avatarError, setAvatarError] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiClient.getCurrentUser()
                if (response.success && response.data) {
                    setUser(response.data)
                    setEditedName(response.data.name || "")
                    setEditedAvatar(response.data.avatar || "")
                    setAvatarError(false)
                } else {
                    setError("Failed to load profile")
                }
            } catch (err) {
                setError("Failed to load profile")
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [])

    const handleSave = async () => {
        if (!user?.canEditProfile) return

        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await apiClient.updateProfile({
                name: editedName.trim() || undefined,
                avatar: editedAvatar.trim() || undefined,
            })

            if (response.success && response.data) {
                setUser(response.data)
                setIsEditing(false)
                setSuccess("Profile updated successfully!")
                setTimeout(() => setSuccess(null), 3000)
            } else {
                setError(response.error || "Failed to update profile")
            }
        } catch (err) {
            setError("Failed to update profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        if (user) {
            setEditedName(user.name || "")
            setEditedAvatar(user.avatar || "")
        }
        setIsEditing(false)
        setError(null)
    }

    const getInitials = (name: string | null, email: string): string => {
        if (name) {
            const parts = name.trim().split(" ")
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            }
            return name[0].toUpperCase()
        }
        return email[0].toUpperCase()
    }

    const displayName = user?.name || user?.email || "User"
    const initials = user ? getInitials(user.name, user.email) : "U"

    return (
        <DashboardLayout title="Profile">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Profile Information</CardTitle>
                        <CardDescription>
                            Manage your profile information and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="size-8 animate-spin text-primary" />
                            </div>
                        ) : user ? (
                            <>
                                {/* Avatar Section */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border/70">
                                    <div className="relative">
                                        {user.avatar && !avatarError ? (
                                            <div className="relative size-24 sm:size-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                                                <Image
                                                    src={user.avatar}
                                                    alt={displayName}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                    onError={() => setAvatarError(true)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex size-24 sm:size-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary/20 shadow-lg">
                                                <span className="text-3xl sm:text-4xl font-bold text-primary">
                                                    {initials}
                                                </span>
                                            </div>
                                        )}
                                        {user.canEditProfile && isEditing && (
                                            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                                                <Camera className="size-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                                                {displayName}
                                            </h2>
                                            <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2 mt-1">
                                                <Mail className="size-4" />
                                                {user.email}
                                            </p>
                                        </div>
                                        {user.provider && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs sm:text-sm text-muted-foreground">
                                                    Signed in with:
                                                </span>
                                                <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs sm:text-sm font-medium capitalize">
                                                    {user.provider}
                                                </span>
                                            </div>
                                        )}
                                        {user.canEditProfile && !isEditing && (
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="outline"
                                                size="sm"
                                                className="mt-2"
                                            >
                                                <Pencil className="size-4 mr-2" />
                                                Edit Profile
                                            </Button>
                                        )}
                                        {!user.canEditProfile && (
                                            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                                Profile editing is only available for OAuth accounts
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Form */}
                                {isEditing && user.canEditProfile && (
                                    <div className="space-y-6 pt-4">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="name"
                                                className="text-sm font-medium text-foreground flex items-center gap-2"
                                            >
                                                <UserIcon className="size-4" />
                                                Full Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                                            />
                                        </div>

                                        {/* Avatar URL Field */}
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="avatar"
                                                className="text-sm font-medium text-foreground flex items-center gap-2"
                                            >
                                                <Camera className="size-4" />
                                                Avatar URL
                                            </label>
                                            <input
                                                id="avatar"
                                                type="url"
                                                value={editedAvatar}
                                                onChange={(e) => setEditedAvatar(e.target.value)}
                                                placeholder="https://example.com/avatar.jpg"
                                                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                                            />
                                            {editedAvatar && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                                                    <div className="relative size-16 rounded-full overflow-hidden border-2 border-border">
                                                        <img
                                                            src={editedAvatar}
                                                            alt="Avatar preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Error/Success Messages */}
                                        {error && (
                                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                                {error}
                                            </div>
                                        )}
                                        {success && (
                                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                                                {success}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex-1 sm:flex-none"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="size-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                                disabled={isSaving}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <X className="size-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Account Info (Read-only) */}
                                {!isEditing && (
                                    <div className="space-y-4 pt-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                                    Account Created
                                                </p>
                                                <p className="text-sm sm:text-base text-foreground">
                                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                                    Last Updated
                                                </p>
                                                <p className="text-sm sm:text-base text-foreground">
                                                    {new Date(user.updatedAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Failed to load profile</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
