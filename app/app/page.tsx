          import { createClient } from "@/lib/supabase/server"
import { PostCard } from "@/components/feed/post-card"
import { Search } from "lucide-react"
import Link from "next/link"

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Sabse simple query: Bas posts aur profile le aao
  const { data: posts } = await supabase
    .from("posts")
    .select(`*, profiles(*)`)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <h2 className="text-xl font-bold tracking-tighter">TIGR</h2>
        <Link href="/app/search">
          <Search className="w-6 h-6 text-muted-foreground" />
        </Link>
      </div>

      {/* Feed Area */}
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
          <div className="text-center py-20 text-muted-foreground">
            <p>Abhi yahan koi post nahi hai.</p>
            <Link href="/app/search" className="text-primary font-bold">Dost dhoondo</Link>
          </div>
        )}
      </div>
    </div>
  )
}
