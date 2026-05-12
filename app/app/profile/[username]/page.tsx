import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProfileView } from "@/components/profile/profile-view"

export default async function ProfilePage(props: {
  params: Promise<{ username: string }>
}) {
  const params = await props.params
  const username = decodeURIComponent(params.username)
  
  // Agar URL "edit" hai, toh ye page use handle nahi karega
  if (username === 'edit') return null 

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    // First try to find by username, then by ID (for fallback when username isn't available in nav)
    let profile = null
    let profileError = null
    
    // Check if the param looks like a UUID (user ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username)
    
    if (isUUID) {
      // Try to find by ID first
      const result = await supabase
        .from("profiles")
        .select("*")
        .eq("id", username)
        .single()
      profile = result.data
      profileError = result.error
    } else {
      // Find by username
      const result = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single()
      profile = result.data
      profileError = result.error
    }

    if (profileError || !profile) return notFound()

    // Parallel Fetching
    const [postsRes, followersRes, followingRes, followRecordRes] = await Promise.all([
      supabase.from("posts").select(`*, likes:likes(count), comments:comments(count)`).eq("user_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
      supabase.from("follows").select("*").eq("follower_id", user.id).eq("following_id", profile.id).maybeSingle(),
    ])

    const formattedPosts = (postsRes.data || []).map(p => ({
      ...p,
      likes_count: Array.isArray(p.likes) ? p.likes[0]?.count ?? 0 : 0,
      comments_count: Array.isArray(p.comments) ? p.comments[0]?.count ?? 0 : 0
    }))

    return (
      <ProfileView
        profile={profile}
        posts={formattedPosts}
        highlights={[]}
        followersCount={followersRes.count || 0}
        followingCount={followingRes.count || 0}
        isFollowing={!!followRecordRes.data}
        isOwnProfile={user.id === profile.id}
        currentUserId={user.id}
      />
    )
  } catch (err) {
    console.error("Profile Error:", err)
    return <div className="p-10 text-center font-bold text-red-500">Database Connection Error. Check Tables.</div>
  }
}
