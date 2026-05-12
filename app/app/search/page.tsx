"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft, Loader2, Star, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getBlobUrl } from "@/lib/blob-utils"
import Link from "next/link"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentId(data.user?.id || null))
  }, [])

  const handleSearch = async (val: string) => {
    setQuery(val)
    if (val.length < 2) {
      setUsers([])
      return
    }
    
    setLoading(true)
    // Profiles fetch karna aur sath hi ye check karna ki hum follow karte hain ya nahi
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        is_following:follows!following_id(count)
      `)
      .ilike("username", `%${val}%`)
      .neq("id", currentId)
      .limit(10)

    if (!error) {
      const formattedUsers = data.map((u: any) => ({
        ...u,
        isFollowing: u.is_following?.[0]?.count > 0
      }))
      setUsers(formattedUsers)
    }
    setLoading(false)
  }

  // --- FOLLOW/UNFOLLOW FUNCTION (WITH DUPLICATE CHECK) ---
  const toggleFollow = async (targetId: string, currentlyFollowing: boolean) => {
    if (!currentId) return alert("Please login first")

    if (currentlyFollowing) {
      // Unfollow logic
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: currentId, following_id: targetId })
      
      if (!error) {
        setUsers(users.map(u => u.id === targetId ? { ...u, isFollowing: false } : u))
      }
    } else {
      // Follow logic (Safe insert)
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentId, following_id: targetId })
      
      if (error) {
        if (error.code === '23505') alert("Already following!")
        else alert("Error: " + error.message)
      } else {
        setUsers(users.map(u => u.id === targetId ? { ...u, isFollowing: true } : u))
      }
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Search Header */}
      <div className="flex items-center gap-3 mb-6 sticky top-0 bg-background z-10 py-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Search friends by username..." 
            className="w-full bg-muted/50 border border-border p-2.5 pl-10 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4 max-w-xl mx-auto">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        )}

        {!loading && users.length === 0 && query.length >= 2 && (
          <p className="text-center text-muted-foreground py-10 text-sm">No users found for "@{query}"</p>
        )}

        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 bg-card rounded-2xl border border-border hover:shadow-sm transition-all">
            {/* User Info & Link to Profile */}
            <Link href={`/app/profile/${u.username}`} className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary">
                {u.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm">@{u.username}</p>
                <p className="text-xs text-muted-foreground">{u.full_name || "TIGR User"}</p>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => toggleFollow(u.id, u.isFollowing)}
                className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  u.isFollowing 
                  ? "bg-muted text-muted-foreground border border-border" 
                  : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {u.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
