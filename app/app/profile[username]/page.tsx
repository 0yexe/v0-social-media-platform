import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import ProfileView from "@/components/profile/profile-view"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  // URL se username nikaal kar database mein check kar rahe hain
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single()

  // Agar database mein ye user nahi mila toh 404 dikhao
  if (!profile) {
    notFound()
  }

  // Agar mil gaya toh jo aapne design dikhaya tha (ProfileView) usme data bhej do
  return <ProfileView profile={profile} isCurrentUser={false} />
}
