"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function EditProfilePage() {
  const [profile, setProfile] = useState<any>({ username: '', full_name: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // 1. Purani Bio aur Data load karna
  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  // 2. Nayi Bio save karne ka function
  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio // Ye line database mein bio bhejegi
      })
      .eq("id", user?.id)

    if (error) {
      alert("Galti ho gayi: " + error.message)
    } else {
      // Save hone ke baad wapas profile par bhejna
      router.push(`/app/profile/${profile.username}`)
      router.refresh() 
    }
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
          <Input 
            value={profile.full_name || ''} 
            onChange={e => setProfile({...profile, full_name: e.target.value})}
            className="bg-muted/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-muted-foreground">Bio</label>
          <Textarea 
            placeholder="Apne baare mein kuch achha likhein..." 
            value={profile.bio || ''} 
            onChange={e => setProfile({...profile, bio: e.target.value})}
            className="bg-muted/30 min-h-[120px]"
          />
          <p className="text-[10px] text-muted-foreground text-right">
            {profile.bio?.length || 0} / 150 characters
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="w-full h-12 gradient-primary text-white font-bold rounded-xl shadow-lg"
        >
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
