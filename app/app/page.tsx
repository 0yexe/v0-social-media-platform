// app/app/page.tsx (Updated with extra checks)
import { createClient } from "@/lib/supabase/server"
import { StoryBar } from "@/components/feed/story-bar"
import { PostCard } from "@/components/feed/post-card"
import { Search, UserPlus, Sparkles } from "lucide-react" // New Icons
import type { Story, Post, Profile } from "@/lib/types"

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Profile aur Data fetch logic
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*),
      likes:likes(count),
      comments:comments(count)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar with Search & Suggestions */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
        <h2 className="text-xl font-extrabold tracking-tighter gradient-text">TIGR</h2>
        <div className="flex gap-4">
          <Search className="w-6 h-6 text-muted-foreground cursor-pointer" onClick={() => {/* Search Page pe bhejo */}} />
          <UserPlus className="w-6 h-6 text-muted-foreground cursor-pointer" />
        </div>
      </div>

      {/* Stories */}
      <div className="bg-card border-b border-border mb-2">
        <StoryBar stories={[]} currentUserId={user.id} currentUserProfile={profile} />
      </div>

      {/* Feed */}
      <div className="max-w-xl mx-auto p-4 space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={{
                ...post,
                likes_count: post.likes?.[0]?.count || 0,
                comments_count: post.comments?.[0]?.count || 0
              } as any} 
              currentUserId={user.id} 
            />
          ))
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
            <h3 className="font-bold text-lg">No posts in your area</h3>
            <p className="text-sm text-muted-foreground">Follow friends to see their updates here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
