import { createClient } from "@/lib/supabase/server"
import { StoryBar } from "@/components/feed/story-bar"
import { PostCard } from "@/components/feed/post-card"
import { Search, UserPlus, Sparkles } from "lucide-react"
import Link from "next/link" // Kami door ki
import type { Story, Post, Profile } from "@/lib/types"

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Profile Fetch
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  
  // Stories Fetch (Nayi stories nikalna)
  const { data: stories } = await supabase
    .from("stories")
    .select(`*, profiles (*)`)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  // Posts Fetch with Likes/Comments count
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
      {/* Top Bar - Fixed & Functional */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
        <h2 className="text-xl font-extrabold tracking-tighter gradient-text">TIGR</h2>
        <div className="flex gap-4">
          <Link href="/app/search">
            <Search className="w-6 h-6 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
          </Link>
          <Link href="/app/suggestions">
            <UserPlus className="w-6 h-6 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>

      {/* Stories - Ab stories dikhengi */}
      <div className="bg-card border-b border-border mb-2">
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
              post={{
                ...post,
                likes_count: post.likes?.[0]?.count || 0,
                comments_count: post.comments?.[0]?.count || 0
              } as any} 
              currentUserId={user.id} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold italic">Nothing to show yet!</h3>
            <p className="text-muted-foreground mt-2 max-w-[280px]">
              Upload your first post or follow friends to see updates in your feed.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
