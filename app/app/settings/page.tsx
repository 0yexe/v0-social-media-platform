"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  User,
  Lock,
  Bell,
  Moon,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Loader2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { getBlobUrl } from "@/lib/blob-utils"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeSection, setActiveSection] = useState<"main" | "profile" | "privacy">("main")
  const [isDark, setIsDark] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Form states
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [hideFollowing, setHideFollowing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        if (data) {
          setProfile(data)
          setUsername(data.username)
          setBio(data.bio || "")
          setIsPrivate(data.is_private)
          setHideFollowing(data.hide_following)
        }
      }
      setLoading(false)
    }

    fetchProfile()
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "avatars")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { pathname } = await response.json()

      const supabase = createClient()
      await supabase
        .from("profiles")
        .update({ profile_pic_url: pathname })
        .eq("id", profile.id)

      setProfile({ ...profile, profile_pic_url: pathname })
    } catch (error) {
      console.error("Photo upload error:", error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({ username, bio })
      .eq("id", profile.id)

    setSaving(false)
    router.refresh()
  }

  const handleSavePrivacy = async () => {
    if (!profile) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({ is_private: isPrivate, hide_following: hideFollowing })
      .eq("id", profile.id)

    setSaving(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark")
    setIsDark(!isDark)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const renderMain = () => (
    <div className="space-y-2">
      {/* Profile Link */}
      <button
        onClick={() => setActiveSection("profile")}
        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary transition-colors"
      >
        <Avatar className="w-12 h-12">
          <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
          <AvatarFallback className="gradient-primary text-white">
            {profile?.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left">
          <p className="font-semibold">{profile?.username}</p>
          <p className="text-sm text-muted-foreground">Edit profile</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>

      <div className="py-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase px-4 mb-2">
          Settings
        </p>

        <button
          onClick={() => setActiveSection("privacy")}
          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Privacy</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Notifications</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Moon className="w-5 h-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Dark Mode</span>
          <div
            className={`w-12 h-7 rounded-full transition-colors ${
              isDark ? "bg-primary" : "bg-muted"
            }`}
          >
            <motion.div
              animate={{ x: isDark ? 22 : 2 }}
              className="w-5 h-5 mt-1 rounded-full bg-white shadow-sm"
            />
          </div>
        </button>

        <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-secondary transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium">Help & Support</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-destructive/10 transition-colors text-destructive"
      >
        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <LogOut className="w-5 h-5" />
        </div>
        <span className="flex-1 text-left font-medium">Log Out</span>
      </button>
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
            <AvatarFallback className="text-2xl gradient-primary text-white">
              {profile?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {uploadingPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg border-2 border-card"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <Button 
          variant="outline" 
          className="rounded-xl"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
        >
          {uploadingPhoto ? "Uploading..." : "Change Photo"}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
            className="mt-1.5 rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="mt-1.5 rounded-xl resize-none"
            maxLength={150}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {bio.length}/150
          </p>
        </div>
      </div>

      <Button
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full gradient-primary text-white rounded-xl"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )

  const renderPrivacy = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Private Account</p>
              <p className="text-xs text-muted-foreground">
                Only approved followers can see your posts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-12 h-7 rounded-full transition-colors ${
              isPrivate ? "bg-primary" : "bg-muted"
            }`}
          >
            <motion.div
              animate={{ x: isPrivate ? 22 : 2 }}
              className="w-5 h-5 mt-1 rounded-full bg-white shadow-sm"
            />
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hideFollowing ? (
              <EyeOff className="w-5 h-5 text-primary" />
            ) : (
              <Eye className="w-5 h-5 text-primary" />
            )}
            <div>
              <p className="font-medium">Hide Following List</p>
              <p className="text-xs text-muted-foreground">
                Others won&apos;t see who you follow
              </p>
            </div>
          </div>
          <button
            onClick={() => setHideFollowing(!hideFollowing)}
            className={`w-12 h-7 rounded-full transition-colors ${
              hideFollowing ? "bg-primary" : "bg-muted"
            }`}
          >
            <motion.div
              animate={{ x: hideFollowing ? 22 : 2 }}
              className="w-5 h-5 mt-1 rounded-full bg-white shadow-sm"
            />
          </button>
        </div>
      </div>

      <Button
        onClick={handleSavePrivacy}
        disabled={saving}
        className="w-full gradient-primary text-white rounded-xl"
      >
        {saving ? "Saving..." : "Save Privacy Settings"}
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 p-4 max-w-xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              activeSection === "main"
                ? router.back()
                : setActiveSection("main")
            }
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">
            {activeSection === "main"
              ? "Settings"
              : activeSection === "profile"
              ? "Edit Profile"
              : "Privacy"}
          </h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4">
        {activeSection === "main" && renderMain()}
        {activeSection === "profile" && renderProfile()}
        {activeSection === "privacy" && renderPrivacy()}
      </div>
    </div>
  )
}
