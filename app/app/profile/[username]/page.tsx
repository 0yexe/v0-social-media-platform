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
    // 1. Profile Fetch karna
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single()

    if (profileError || !profile) return notFound()

    // 2. Parallel Fetching (Highlights ko temporary hata diya hai error rokne ke liye)
    const [postsRes, followersRes, followingRes, followRecordRes] = await Promise.all([
      supabase.from("posts").select(`*, likes:likes(count), comments:comments(count)`).eq("user_id", profile.id).order("created_at", { ascending: false }),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
      supabase.from("follows").select("*").eq("follower_id", user.id).eq("following_id", profile.id).maybeSingle(),
    ])

    // Posts ko format karna
    const formattedPosts = (postsRes.data || []).map(p => ({
      ...p,
      likes_count: Array.isArray(p.likes) ? p.likes[0]?.count ?? 0 : 0,
      comments_count: Array.isArray(p.comments) ? p.comments[0]?.count ?? 0 : 0
    }))

    // Temporary Highlights data (taki crash na ho)
    const highlightsData: any[] = []

    return (
      <ProfileView
        profile={profile}
        posts={formattedPosts}
        highlights={highlightsData}
        followersCount={followersRes.count || 0}
        followingCount={followingRes.count || 0}
        isFollowing={!!followRecordRes.data}
        isOwnProfile={user.id === profile.id}
        currentUserId={user.id}
      />
    )
  } catch (err) {
    console.error("Profile Error:", err)
    // Error aane par user ko message dikhana
    return (
      <div className="p-10 text-center">
        <h2 className="text-red-500 font-bold text-xl mb-4">Database Connection Issue</h2>
        <p className="text-muted-foreground">Bhai, shayad database tables mein kuch kami hai. Ek baar Supabase check karo.</p>
      </div>
    )
  }
}
