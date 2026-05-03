import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ProfileView from "@/components/profile/profile-view"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  // 1. Pehle login user ki detail nikaalte hain
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Database se us profile ko dhoondte hain jiska username URL mein hai
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single()

  // Agar database mein error hai ya profile nahi mili
  if (error || !profile) {
    console.error("Profile fetch error:", error)
    notFound()
  }

  // 3. Check karo kya ye login user ki apni profile hai?
  const isCurrentUser = user?.id === profile.id

  // 4. Data ko design (ProfileView) mein bhej do
  return (
    <div className="min-h-screen bg-background">
      <ProfileView 
        profile={profile} 
        isCurrentUser={isCurrentUser} 
      />
    </div>
  )
}
