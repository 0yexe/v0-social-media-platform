"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function FollowButton({ targetUserId, currentUserId, initialIsFollowing }: any) {
  const router = useRouter()
  const supabase = createClient()
  
  // Local state taaki UI ekdum fast update ho
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleToggleFollow = async () => {
    if (!currentUserId || !targetUserId) {
      console.error("TIGR Error: currentUserId ya targetUserId missing hai!")
      return
    }

    setLoading(true)
    // Optimistic Update: Pehle hi UI badal do taaki user ko lagne lage kaam ho gaya
    setIsFollowing(!isFollowing)

    if (isFollowing) {
      // ❌ UNFOLLOW LOGIC
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId })

      if (error) {
        console.error("Unfollow karne mein error aaya:", error.message)
        setIsFollowing(true) // Error aaya toh wapas purani state par le jao
      }
    } else {
      //  FOLLOW LOGIC
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: targetUserId })

      if (error) {
        console.error("Follow karne mein error aaya:", error.message)
        setIsFollowing(false) // Error aaya toh wapas purani state par le jao
      }
    }

    setLoading(false)
    // Background mein data refresh karo taaki follow count update ho jaye
    router.refresh()
  }

  return (
    <button 
      onClick={handleToggleFollow}
      disabled={loading || currentUserId === targetUserId}
      className={`px-6 py-1.5 rounded-full font-bold text-sm transition-all active:scale-95 disabled:opacity-50 ${
        isFollowing ? "bg-muted text-foreground border border-border" : "gradient-primary text-white shadow-sm"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  )
}
