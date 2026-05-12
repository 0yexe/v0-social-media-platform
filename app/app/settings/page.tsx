"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, User, Lock, Bell, Moon, HelpCircle, LogOut,
  ChevronRight, Shield, Eye, EyeOff, Camera, Loader2, DollarSign, Zap
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { getBlobUrl } from "@/lib/blob-utils"

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
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
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          if (data) {
            setProfile(data)
            setUsername(data.username || "")
            setBio(data.bio || "")
            setIsPrivate(data.is_private || false)
            setHideFollowing(data.hide_following || false)
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
    setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  // Actions
  const handleSaveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from("profiles").update({ username, bio }).eq("id", profile.id)
    setSaving(false)
    setActiveSection("main")
    router.refresh()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4 max-w-xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => activeSection === "main" ? router.back() : setActiveSection("main")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            {activeSection === "main" ? "Settings" : activeSection === "profile" ? "Edit Profile" : "Privacy"}
          </h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {activeSection === "main" && (
            <motion.div key="main" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
              {/* Profile Header */}
              <button onClick={() => setActiveSection("profile")} className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-border/50">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-border">
                    <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
                    <AvatarFallback className="gradient-primary text-white font-bold">{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-bold text-lg">{profile?.username}</p>
                    <p className="text-sm text-muted-foreground">Edit profile</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* General Settings */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase px-4 mb-3 tracking-widest">Settings</p>
                <SettingItem icon={Lock} label="Privacy" onClick={() => setActiveSection("privacy")} iconBg="bg-blue-100 dark:bg-blue-900/20" iconColor="text-blue-600" />
                <SettingItem icon={Bell} label="Notifications" iconBg="bg-orange-100 dark:bg-orange-900/20" iconColor="text-orange-600" />
                <SettingItem icon={HelpCircle} label="Help & Support" iconBg="bg-green-100 dark:bg-green-900/20" iconColor="text-green-600" />
              </div>

              {/* Monetization */}
              <div className="space-y-1 pt-4 border-t border-border">
                <p className="text-[11px] font-bold text-muted-foreground uppercase px-4 mb-3 tracking-widest">Earnings</p>
                <SettingItem icon={DollarSign} label="Monetize" subLabel="Earn from your content" badge="Coming Soon" iconBg="bg-gray-100 dark:bg-gray-800" iconColor="text-gray-500" />
                <SettingItem icon={Zap} label="Super Monetize" subLabel="Unlock advanced earning" badge="Coming Soon" iconBg="bg-gray-100 dark:bg-gray-800" iconColor="text-gray-500" />
              </div>

              {/* Logout */}
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all group">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                  <LogOut className="w-5 h-5 text-red-600 group-hover:text-white" />
                </div>
                <span className="font-bold text-red-600">Log Out</span>
              </button>
            </motion.div>
          )}

          {activeSection === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
              <div className="flex flex-col items-center gap-4 py-4">
                <Avatar className="w-24 h-24 border-2 border-primary/20">
                  <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
                  <AvatarFallback className="text-2xl gradient-primary text-white">{profile?.username?.[0]}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="rounded-full">Change Photo</Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold px-1">Username</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold px-1">Bio</label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl min-h-[100px]" placeholder="Write something about yourself..." />
                </div>
                <Button onClick={handleSaveProfile} disabled={saving} className="w-full gradient-primary text-white rounded-xl py-6">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          )}

          {activeSection === "privacy" && (
            <motion.div key="privacy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4 text-center py-20">
              <Shield className="w-16 h-16 text-primary mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-bold">Privacy Settings</h2>
              <p className="text-muted-foreground">Privacy features are coming soon to your account.</p>
              <Button onClick={() => setActiveSection("main")} variant="link">Go Back</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SettingItem({ icon: Icon, label, subLabel, badge, onClick, iconBg, iconColor }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-all cursor-pointer group">
      <div className="flex items-center gap-4 text-left">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{label}</span>
            {badge && <span className="text-[9px] font-bold bg-muted border border-border text-muted-foreground px-2 py-0.5 rounded-full">{badge}</span>}
          </div>
          {subLabel && <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </div>
  )
}
