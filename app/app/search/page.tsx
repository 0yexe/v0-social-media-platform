"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft, Loader2, UserPlus, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getBlobUrl } from "@/lib/blob-utils"

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
    if (val.length < 2) return setUsers([])
    
    setLoading(true)
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${val}%`)
      .neq("id", currentId)
      .limit(10)
    
    setUsers(data || [])
    setLoading(false)
  }

  // --- FOLLOW FUNCTION ---
  const followUser = async (targetId: string) => {
    if (!currentId) return alert("Please login first")
    const { error } = await supabase
      .from("following")
      .insert({ user_id: currentId, following_id: targetId })
    
    if (error) alert("Could not follow: " + error.message)
    else alert("Following successfully!")
  }

  // --- SIMPLE FOLLOW FUNCTION ---
  const simpleFollow = async (targetId: string) => {
    if (!currentId) return
    const { error } = await supabase
      .from("simple_follows")
      .insert({ user_id: currentId, target_id: targetId })
    
    if (error) alert("Error: " + error.message)
    else alert("Added to Simple Follow!")
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center gap-3 mb-6">
        <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Search username..." 
            className="w-full bg-muted p-2 pl-10 rounded-xl outline-none"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading && <Loader2 className="animate-spin mx-auto" />}
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 bg-card rounded-2xl border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10" />
              <span className="font-bold">@{u.username}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => simpleFollow(u.id)} className="p-2 bg-muted rounded-lg text-xs">
                <Star className="w-4 h-4" />
              </button>
              <button 
                onClick={() => followUser(u.id)} 
                className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                Follow
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
