"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, Camera } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({ username: "", full_name: "", bio: "" })
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push("/login")

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (data) setProfile(data)
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio
      })
      .eq("id", user?.id)

    if (error) alert("Error updating profile: " + error.message)
    else {
      alert("Profile updated!")
      router.refresh()
      router.back()
    }
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-background p-4 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative">
            <Camera className="text-muted-foreground" />
          </div>
          <p className="text-xs text-primary font-medium">Change Photo</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium ml-1">Username</label>
            <Input 
              value={profile.username} 
              onChange={(e) => setProfile({...profile, username: e.target.value})}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium ml-1">Full Name</label>
            <Input 
              value={profile.full_name} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium ml-1">Bio</label>
            <textarea 
              value={profile.bio} 
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full bg-background border border-input rounded-xl p-3 text-sm outline-none focus:ring-1 ring-primary"
              rows={4}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full rounded-xl gradient-primary font-bold h-12"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
              }
