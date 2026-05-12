import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfileRedirectPage() {
  const supabase = await createClient()
  
  // 1. Check karo user logged in hai ya nahi
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 2. Database se is user ka username nikaal rahe hain
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  // 3. Sabse Zaroori: Sahi path par redirect karna
  if (profile?.username) {
    // Yahan '/app' lagana bahut zaroori hai kyunki aapka folder structure 'app/app/profile/...' hai
    redirect(`/app/profile/${encodeURIComponent(profile.username)}`)
  } else {
    // Agar username nahi mila (nayi profile hai), toh home ya onboarding par bhejein
    console.error("Username not found for user:", user.id)
    redirect("/app")
  }
}
