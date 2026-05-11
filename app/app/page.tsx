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

  // 1. Fetch current user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 2. Fetch Stories (Filtering only active ones)
  const { data: stories } = await supabase
    .from("stories")
    .select(`*, profiles (*)`)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  // 3. Fetch Posts (Ensuring we get all media for the feed)
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*),
      likes (user_id),
      comments (id)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Stories Section */}
      <div className="bg-card border-b border-border sticky top-0 z-20 backdrop-blur-md bg-opacity-90">
        <StoryBar
          stories={(stories || []) as (Story & { profiles: Profile })[]}
          currentUserId={user.id}
          currentUserProfile={profile}
        />
      </div>

      {/* Main Feed Section */}
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
          /* English Empty State */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-muted flex items-center justify-center">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Your feed is empty!</h3>
            <p className="text-muted-foreground mt-2 max-w-[280px] mx-auto">
              Start by uploading your first post or following some amazing creators to see updates here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
