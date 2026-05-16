"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft, Loader2, UserPlus, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getBlobUrl } from "@/lib/blob-utils"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    if (val.trim().length < 2) {
      setUsers([])
      return
    }
    
    setLoading(true)
    
    // Search by username and full_name using .or
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        is_following:follows!following_id(count)
      `)
      .or(`username.ilike.%${val}%,full_name.ilike.%${val}%`)
      .limit(15)

    if (!error && data) {
      const formattedUsers = data.map((u: any) => ({
        ...u,
        isFollowing: u.is_following?.[0]?.count > 0,
        isMe: u.id === currentId // flag to identify current user's own profile
      }))
      setUsers(formattedUsers)
    }
    setLoading(false)
  }

  const toggleFollow = async (targetId: string, currentlyFollowing: boolean) => {
    if (!currentId) return
    
    // Optimistic UI update (reflect changes immediately)
    setUsers(users.map(u => u.id === targetId ? { ...u, isFollowing: !currentlyFollowing } : u))

    if (currentlyFollowing) {
      await supabase.from("follows").delete().match({ follower_id: currentId, following_id: targetId })
    } else {
      await supabase.from("follows").insert({ follower_id: currentId, following_id: targetId })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              autoFocus
              placeholder="Search by name or @username..." 
              className="w-full bg-muted/50 border border-border p-2.5 pl-10 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all text-sm"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-xl mx-auto p-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        )}

        {!loading && users.length === 0 && query.trim().length >= 2 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm font-medium">No users found with this name.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Please check the spelling and try again.</p>
          </div>
        )}

        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 bg-card rounded-2xl border border-border/50 hover:border-border transition-all">
            <Link href={`/app/profile/${u.username}`} className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-12 h-12 border border-border">
                <AvatarImage src={getBlobUrl(u.profile_pic_url)} />
                <AvatarFallback className="gradient-primary text-white font-bold">
                  {u.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-sm truncate">@{u.username}</p>
                  {u.isMe && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">You</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{u.full_name || "TIGR User"}</p>
              </div>
            </Link>

            {/* Actions: Follow/Unfollow Button */}
            {!u.isMe && (
              <button 
                onClick={() => toggleFollow(u.id, u.isFollowing)}
                className={`px-5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  u.isFollowing 
                  ? "bg-secondary text-secondary-foreground border border-border" 
                  : "gradient-primary text-white shadow-sm hover:opacity-90"
                }`}
              >
                {u.isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
