import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProfileView } from "@/components/profile/profile-view"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const resolvedParams = await params
  const username = decodeURIComponent(resolvedParams.username) // Safe decoding
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Fetch Profile Data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (!profile) {
    notFound() // Agar username galat hai toh 404 dikhayega
  }

  // 2. Fetch Posts (Counts ko array handling ke liye fix kiya)
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      likes:likes(count),
      comments:comments(count)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  // 3. Fetch Follower/Following Counts (Stable logic)
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id)

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id)

  // 4. Check if Current User Follows this Profile
  const { data: followRecord } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", profile.id)
    .maybeSingle() // .single() ki jagah .maybeSingle() use karein taaki error na aaye

  // 5. Fetch Highlights (Safe check ke saath)
  const { data: highlights } = await supabase
    .from('highlights')
    .select(`
      *,
      highlight_items (
        story_id,
        stories (*)
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .catch(() => ({ data: [] })) // Agar table nahi hai toh crash nahi hoga

  const isOwnProfile = user.id === profile.id

  // Data ko transform karke view mein bhej rahe hain
  const formattedPosts = posts?.map(p => ({
    ...p,
    likes_count: p.likes?.[0]?.count ?? 0,
    comments_count: p.comments?.[0]?.count ?? 0
  }))

  return (
    <ProfileView
      profile={profile}
      posts={formattedPosts || []}
      highlights={highlights || []}
      followersCount={followersCount || 0}
      followingCount={followingCount || 0}
      isFollowing={!!followRecord}
      isOwnProfile={isOwnProfile}
      currentUserId={user.id}
    />
  )
}
