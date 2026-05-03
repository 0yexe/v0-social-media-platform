import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfileRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Database se is user ka username nikaal rahe hain
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  if (profile?.username) {
    // Agar username mil gaya (jaise 'anish'), toh asli page par bhej dega
    redirect(`/profile/${profile.username}`)
  } else {
    // Agar username nahi hai, toh wapas home par
    redirect("/app")
  }
}
