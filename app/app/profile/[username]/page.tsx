    import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProfileView } from "@/components/profile/profile-view"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  // 1. Params ko await aur decode karein
  const resolvedParams = await params
  const username = decodeURIComponent(resolvedParams.username)
  
  const supabase = await createClient()
  
  // 2. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    // 3. Profile Fetch karein
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()

    if (profileError || !profile) {
      return notFound()
    }

    // 4. Saara data ek saath fetch karein (Parallel Fetching)
    const [postsRes, followersRes, followingRes, followRecordRes, highlightsRes] = await Promise.all([
      // Posts with counts
      supabase
        .from("posts")
        .select(`*, likes:likes(count), comments:comments(count)`)
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),
      
      // Followers count
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile.id),
      
      // Following count
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      
      // Check if following
      supabase
        .from("follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", profile.id)
        .maybeSingle(),

      // Highlights (Safety ke liye empty array default)
      supabase
        .from('highlights')
        .select(`*, highlight_items (story_id, stories (*))`)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
    ])

    // 5. Data ko safely format karein (Crash hone se bachane ke liye)
    const formattedPosts = (postsRes.data || []).map(p => ({
      ...p,
      // Supabase count array return karta hai: [{count: 5}]
      likes_count: Array.isArray(p.likes) ? p.likes[0]?.count ?? 0 : (p.likes as any)?.count ?? 0,
      comments_count: Array.isArray(p.comments) ? p.comments[0]?.count ?? 0 : (p.comments as any)?.count ?? 0
    }))

    const isOwnProfile = user.id === profile.id

    return (
      <ProfileView
        profile={profile}
        posts={formattedPosts}
        highlights={highlightsRes.data || []}
        followersCount={followersRes.count || 0}
        followingCount={followingRes.count || 0}
        isFollowing={!!followRecordRes.data}
        isOwnProfile={isOwnProfile}
        currentUserId={user.id}
      />
    )

  } catch (err) {
    console.error("Critical Profile Error:", err)
    // Agar koi badi galti ho toh crash ki jagah user ko message dikhao
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-xl font-bold">Unable to load profile</h2>
        <p className="text-muted-foreground mt-2">Server connection issue. Please refresh the page.</p>
      </div>
    )
  }
}
