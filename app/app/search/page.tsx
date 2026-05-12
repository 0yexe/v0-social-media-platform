"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft, UserPlus, UserCheck, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getBlobUrl } from "@/lib/blob-utils"
import Link from "next/link"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [])

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        setLoading(true)
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", `%${searchQuery}%`) // Kisi bhi user ko search karne ke liye
          .neq("id", currentUser?.id) // Khud ko search mein nahi dikhayega
          .limit(20)

        if (!error) setResults(data || [])
        setLoading(false)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, currentUser])

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search friends by username..."
              className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-1 ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-muted/30 transition-all">
                <Link href={`/app/profile/${user.username}`} className="flex items-center gap-3 flex-1">
                  <Avatar className="w-12 h-12 border border-border">
                    <AvatarImage src={getBlobUrl(user.profile_pic_url)} />
                    <AvatarFallback className="gradient-primary text-white font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.full_name || "TIGR User"}</p>
                  </div>
                </Link>
                <Button size="sm" className="rounded-full px-4 gradient-primary text-white text-xs h-8">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        ) : searchQuery.length > 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No users found with "@{searchQuery}"</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">Find your friends on TIGR</p>
          </div>
        )}
      </div>
    </div>
  )
}
