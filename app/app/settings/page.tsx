"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, User, Lock, Bell, Moon, HelpCircle, LogOut,
  ChevronRight, Shield, Eye, EyeOff, Camera, Loader2, 
  DollarSign, Zap, Globe, ShieldCheck, Heart, UserPlus, 
  MessageCircle, BarChart3, Palette, Volume2, Database, 
  Smartphone, Share2, Bookmark
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getBlobUrl } from "@/lib/blob-utils"

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<"main" | "privacy">("main")
  const [isDark, setIsDark] = useState(false)
  const router = useRouter()

  // Privacy States
  const [isPrivate, setIsPrivate] = useState(false)
  const [followingVisibility, setFollowingVisibility] = useState("public")

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) {
          setProfile(data)
          setIsPrivate(data.is_private || false)
          setFollowingVisibility(data.following_visibility || "public")
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-primary">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 p-4 max-w-xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => activeSection === "main" ? router.back() : setActiveSection("main")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            {activeSection === "main" ? "Settings" : "Privacy Settings"}
          </h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {activeSection === "main" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              
              {/* Profile Card */}
              <button onClick={() => router.push('/app/settings/profile')} className="w-full flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-background shadow-sm">
                    <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
                    <AvatarFallback className="gradient-primary text-white font-bold">{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-bold text-lg leading-tight">{profile?.username}</p>
                    <p className="text-sm text-muted-foreground">Edit profile info</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* 1. Account & Security Section */}
              <div className="space-y-1">
                <p className="section-label">Account & Security</p>
                <SettingItem icon={Lock} label="Privacy" onClick={() => setActiveSection("privacy")} iconBg="bg-blue-100" iconColor="text-blue-600" />
                <SettingItem icon={ShieldCheck} label="Security Checkup" iconBg="bg-green-100" iconColor="text-green-600" />
                <SettingItem icon={Bell} label="Notifications" iconBg="bg-orange-100" iconColor="text-orange-600" />
                <SettingItem icon={Globe} label="Language" iconBg="bg-purple-100" iconColor="text-purple-600" />
              </div>

              {/* 2. Monetization (Earnings) Section */}
              <div className="space-y-1">
                <p className="section-label">Professional Tools</p>
                <SettingItem icon={DollarSign} label="Monetize" badge="Coming Soon" subLabel="Earn from content" iconBg="bg-gray-100" iconColor="text-gray-600" />
                <SettingItem icon={Zap} label="Super Monetize" badge="Pro" subLabel="Premium access" iconBg="bg-yellow-100" iconColor="text-yellow-600" />
                <SettingItem icon={BarChart3} label="Insights & Analytics" iconBg="bg-blue-50" iconColor="text-blue-500" />
              </div>

              {/* 3. NEW: App Personalization (10 New Options Mix) */}
              <div className="space-y-1">
                <p className="section-label">App Experience</p>
                <SettingItem icon={Palette} label="Theme & Colors" subLabel="Customize app look" iconBg="bg-pink-100" iconColor="text-pink-600" />
                <SettingItem icon={Volume2} label="Sound Effects" iconBg="bg-cyan-100" iconColor="text-cyan-600" />
                <SettingItem icon={Database} label="Data Saver" iconBg="bg-indigo-100" iconColor="text-indigo-600" />
                <SettingItem icon={Smartphone} label="Connected Devices" iconBg="bg-slate-100" iconColor="text-slate-700" />
                <SettingItem icon={MessageCircle} label="Chat Settings" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                <SettingItem icon={Heart} label="Liked Posts" iconBg="bg-red-50" iconColor="text-red-500" />
                <SettingItem icon={Bookmark} label="Saved Items" iconBg="bg-amber-50" iconColor="text-amber-600" />
                <SettingItem icon={UserPlus} label="Invite Friends" iconBg="bg-sky-100" iconColor="text-sky-600" />
                <SettingItem icon={Share2} label="Direct Sharing" iconBg="bg-rose-100" iconColor="text-rose-600" />
                <SettingItem icon={HelpCircle} label="Report a Problem" iconBg="bg-gray-100" iconColor="text-gray-700" />
              </div>

              {/* Logout */}
              <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 hover:bg-destructive/10 rounded-2xl transition-all text-destructive border border-destructive/10 group mt-8">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center transition-colors group-hover:bg-destructive">
                  <LogOut className="w-5 h-5 text-destructive group-hover:text-white" />
                </div>
                <span className="font-bold">Log Out</span>
              </button>
            </motion.div>
          )}

          {/* Privacy Section Render */}
          {activeSection === "privacy" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-bold">Private Account</span>
                  </div>
                  <button onClick={() => setIsPrivate(!isPrivate)} className={`w-11 h-6 rounded-full relative transition-colors ${isPrivate ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPrivate ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground px-8">Only approved followers can see your posts.</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase px-2">Who can see your following list?</p>
                {['public', 'followers', 'only_me'].map((opt) => (
                  <button key={opt} onClick={() => setFollowingVisibility(opt)} className={`w-full p-4 rounded-xl border flex justify-between capitalize text-sm font-medium ${followingVisibility === opt ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    {opt.replace('_', ' ')}
                    {followingVisibility === opt && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                  </button>
                ))}
              </div>
              <Button onClick={() => setActiveSection("main")} className="w-full gradient-primary text-white rounded-xl py-6">Save Privacy</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .section-label {
          font-size: 11px;
          font-weight: 700;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          padding: 0 16px;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  )
}

function SettingItem({ icon: Icon, label, subLabel, badge, onClick, iconBg, iconColor }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 hover:bg-muted/40 rounded-2xl transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">{label}</span>
            {badge && <span className="text-[9px] font-bold bg-secondary border border-border text-muted-foreground px-1.5 py-0.5 rounded-full">{badge}</span>}
          </div>
          {subLabel && <p className="text-[11px] text-muted-foreground mt-0.5">{subLabel}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </div>
  )
                  }
