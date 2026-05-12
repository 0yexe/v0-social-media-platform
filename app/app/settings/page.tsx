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
  DollarSign,
  Zap,
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

  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [hideFollowing, setHideFollowing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
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
      const response = await fetch("/api/upload", { method: "POST", body: formData })
      const { pathname } = await response.json()
      const supabase = createClient()
      await supabase.from("profiles").update({ profile_pic_url: pathname }).eq("id", profile.id)
      setProfile({ ...profile, profile_pic_url: pathname })
    } catch (error) {
      console.error(error)
    } finally { setUploadingPhoto(false) }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from("profiles").update({ username, bio }).eq("id", profile.id)
    setSaving(false)
    router.refresh()
    setActiveSection("main")
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  )

  const renderMain = () => (
    <div className="space-y-6">
      {/* Profile Header Section */}
      <button
        onClick={() => setActiveSection("profile")}
        className="w-full flex items-center justify-between p-4 group"
      >
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border border-border">
            <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
            <AvatarFallback className="text-xl gradient-primary text-white font-bold">
              {profile?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="text-lg font-bold">{profile?.username}</p>
            <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Edit profile</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Settings Menu Section */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-muted-foreground uppercase px-4 mb-3 tracking-widest">Settings</p>
        
        <SettingItem 
          icon={Lock} 
          label="Privacy" 
          onClick={() => setActiveSection("privacy")}
          iconBg="bg-blue-100 dark:bg-blue-900/20" 
          iconColor="text-blue-600"
        />
        
        <SettingItem 
          icon={Bell} 
          label="Notifications" 
          iconBg="bg-orange-100 dark:bg-orange-900/20" 
          iconColor="text-orange-600"
        />

        <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="font-medium">Dark Mode</span>
          </div>
          <div 
            onClick={toggleDarkMode}
            className={`w-11 h-6 rounded-full p-1 transition-colors relative ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </div>

        <SettingItem 
          icon={HelpCircle} 
          label="Help & Support" 
          iconBg="bg-green-100 dark:bg-green-900/20" 
          iconColor="text-green-600"
        />
      </div>

      <hr className="border-border mx-4" />

      {/* Monetization Section (Screenshot Style) */}
      <div className="space-y-1">
        <SettingItem 
          icon={DollarSign} 
          label="Monetize" 
          subLabel="Earn from your content" 
          badge="Coming Soon"
          iconBg="bg-gray-100 dark:bg-gray-800" 
          iconColor="text-gray-500" 
        />
        
        <SettingItem 
          icon={Zap} 
          label="Super Monetize" 
          subLabel="Unlock advanced earning" 
          badge="Coming Soon"
          iconBg="bg-gray-100 dark:bg-gray-800" 
          iconColor="text-gray-500" 
        />
      </div>

      <hr className="border-border mx-4" />

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <LogOut className="w-5 h-5 text-red-600" />
        </div>
        <span className="flex-1 text-left font-bold text-red-600">Log Out</span>
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4 max-w-xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => activeSection === "main" ? router.back() : setActiveSection("main")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            {activeSection === "main" ? "Settings" : activeSection === "profile" ? "Edit Profile" : "Privacy"}
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

// Reusable Menu Item Component
function SettingItem({ icon: Icon, label, subLabel, badge, onClick, iconBg, iconColor }: any) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 text-left">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {badge && (
              <span className="text-[9px] font-bold bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subLabel && <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </div>
  )
}
