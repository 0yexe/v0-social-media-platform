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

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch stories (not expired)
  const { data: stories } = await supabase
    .from("stories")
    .select(`
      *,
      profiles (*)
    `)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  // Fetch posts with profiles, likes count, and comments count
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*),
      likes (user_id),
      comments (id)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      {/* Stories */}
      <StoryBar
        stories={(stories || []) as (Story & { profiles: Profile })[]}
        currentUserId={user.id}
        currentUserProfile={profile}
      />

      {/* Feed */}
      <div className="max-w-xl mx-auto p-4 space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post as Post & { profiles: Profile; likes: { user_id: string }[]; comments: { id: string }[] }}
              currentUserId={user.id}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-10 h-10 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Follow some users or create your first post!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
