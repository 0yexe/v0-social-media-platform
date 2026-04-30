import { createClient } from "@/lib/supabase/server"
import { ExploreGrid } from "@/components/explore/explore-grid"

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get all posts for explore
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles(*),
      likes(count),
      comments(count)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  return <ExploreGrid posts={posts || []} />
}
