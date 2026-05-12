import { createClient } from "@/lib/supabase/server"
import { StoryBar } from "@/components/feed/story-bar"
import { PostCard } from "@/components/feed/post-card"
import { Search, UserPlus, Sparkles } from "lucide-react"
import Link from "next/link"
import type { Story, Post, Profile } from "@/lib/types"

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // 1. Profile Fetch
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  // 2. Stories Fetch (Active stories only)
  const { data: stories } = await supabase
    .from("stories")
    .select(`*, profiles (*)`)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  // 3. Posts Fetch (Correct Count Logic)
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

  if (error) {
    console.error("Database Error:", error.message)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-30">
        <h2 className="text-xl font-black tracking-tighter text-primary">TIGR</h2>
        <div className="flex gap-4">
          <Link href="/app/search">
            <Search className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
          </Link>
          <Link href="/app/suggestions">
            <UserPlus className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
          </Link>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-card border-b border-border mb-2">
        <StoryBar 
          stories={(stories || []) as (Story & { profiles: Profile })[]} 
          currentUserId={user.id} 
          currentUserProfile={profile} 
        />
      </div>

      {/* Posts Feed */}
      <div className="max-w-xl mx-auto p-4 space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={{
                ...post,
                // Count handle karne ka sahi tarika
                likes_count: post.likes?.[0]?.count ?? 0,
                comments_count: post.comments?.[0]?.count ?? 0
              } as any} 
              currentUserId={user.id} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-bold italic">No posts yet!</h3>
            <p className="text-muted-foreground mt-2 max-w-[280px]">
              Be the first one to post something or search for friends to follow.
            </p>
            <Link href="/app/search" className="mt-6 text-primary font-bold hover:underline">
              Find friends to follow
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
