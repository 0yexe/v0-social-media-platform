          import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProfileView } from "@/components/profile/profile-view"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
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
    notFound()
  }

  // 2. Fetch Posts (Including Telegram IDs for Videos/Photos)
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      telegram_file_id,
      media_type,
      likes(count),
      comments(count)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  // 3. Fetch Follower/Following Counts
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id)

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id)

  // 4. Check if Current User Follows this Profile
  const { data: isFollowing } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", user.id)
    .eq("following_id", profile.id)
    .single()

  // 5. Fetch Highlights (Instagram Style)
  // Archive stories ko group karke dikhane ke liye
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

  const isOwnProfile = user.id === profile.id

  return (
    <ProfileView
      profile={profile}
      posts={posts || []}
      highlights={highlights || []} // Passing highlights to the view
      followersCount={followersCount || 0}
      followingCount={followingCount || 0}
      isFollowing={!!isFollowing}
      isOwnProfile={isOwnProfile}
      currentUserId={user.id}
    />
  )
}
