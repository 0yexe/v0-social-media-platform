            import { createClient } from "@/lib/supabase/server"
import { StoryBar } from "@/components/feed/story-bar"
import { PostCard } from "@/components/feed/post-card"
import type { Story, Post, Profile } from "@/lib/types"

export default async function FeedPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // 1. User Profile Fetch
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 2. Fetch Stories (Sirf wahi jo abhi active hain)
  const { data: stories } = await supabase
    .from("stories")
    .select(`*, profiles (*)`)
    .gt("expires_at", new Date().toISOString()) // Expiry check
    .order("created_at", { ascending: false })

  // 3. Fetch All Media (Posts aur Reels dono)
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*),
      likes (user_id),
      comments (id)
    `)
    .order("created_at", { ascending: false })
    .limit(30) // Thoda zyada limit rakhte hain feed ke liye

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Story Bar */}
      <div className="bg-card border-b border-border sticky top-0 z-20 backdrop-blur-md bg-opacity-80">
        <StoryBar
          stories={(stories || []) as (Story & { profiles: Profile })[]}
          currentUserId={user.id}
          currentUserProfile={profile}
        />
      </div>

      {/* Main Feed */}
      <div className="max-w-xl mx-auto p-4 space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post as any}
              currentUserId={user.id}
            />
          ))
        ) : (
          /* Empty State - Jab koi post na ho */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 mb-6 rounded-3xl bg-muted flex items-center justify-center">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold italic">Abhi kuch nahi hai!</h3>
            <p className="text-muted-foreground mt-2 max-w-[250px]">
              Apni pehli post ya Reel upload karein taaki feed zinda ho sake.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
