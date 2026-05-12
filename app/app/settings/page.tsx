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
  const [activeSection, setActiveSection] = useState<"main" | "profile" | "privacy">("main")
  const router = useRouter()

  // Privacy States
  const [isPrivate, setIsPrivate] = useState(false)
  const [followingVisibility, setFollowingVisibility] = useState("public") // public, followers, only_me

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

  const handleSavePrivacy = async () => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_private: isPrivate, 
        following_visibility: followingVisibility 
      })
      .eq("id", profile.id)
    
    if (!error) {
      alert("Privacy settings updated!")
      setActiveSection("main")
    }
    setSaving(false)
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
            {activeSection === "main" ? "Settings" : activeSection === "privacy" ? "Privacy" : "Edit Profile"}
          </h1>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {activeSection === "main" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <button onClick={() => setActiveSection("profile")} className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50">
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

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase px-4 mb-3 tracking-widest">Settings</p>
                <SettingItem icon={Lock} label="Privacy" onClick={() => setActiveSection("privacy")} iconBg="bg-blue-100 dark:bg-blue-900/20" iconColor="text-blue-600" />
                <SettingItem icon={Bell} label="Notifications" iconBg="bg-orange-100 dark:bg-orange-900/20" iconColor="text-orange-600" />
              </div>
            </motion.div>
          )}

          {activeSection === "privacy" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {/* Option 1: Private Account */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-bold">Private Account</span>
                  </div>
                  <button 
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPrivate ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground px-8">
                  When your account is private, only people you approve can see your photos and videos.
                </p>
              </div>

              {/* Option 2: Following Visibility */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase px-2 tracking-widest">Who can see your following list?</p>
                
                <div className="space-y-2">
                  {['public', 'followers', 'only_me'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setFollowingVisibility(option)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        followingVisibility === option ? 'border-primary bg-primary/5' : 'border-border bg-transparent'
                      }`}
                    >
                      <span className="capitalize font-medium text-sm">
                        {option.replace('_', ' ')}
                      </span>
                      {followingVisibility === option && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSavePrivacy} disabled={saving} className="w-full gradient-primary text-white rounded-xl py-6 mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Privacy Settings"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SettingItem({ icon: Icon, label, onClick, iconBg, iconColor }: any) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </div>
  )
      }
