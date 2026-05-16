"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function FollowButton({ targetUserId, currentUserId, initialIsFollowing }: any) {
  const router = useRouter()
  const supabase = createClient()
  
  // Local state for fast UI updates
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  const handleToggleFollow = async () => {
    if (!currentUserId || !targetUserId) {
      console.error("TIGR Error: currentUserId or targetUserId is missing!")
      return
    }

    setLoading(true)
    // Optimistic update: change UI immediately before server confirms
    setIsFollowing(!isFollowing)

    if (isFollowing) {
      // ❌ UNFOLLOW LOGIC
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId })

      if (error) {
        console.error("Error while unfollowing:", error.message)
        setIsFollowing(true) // Revert to previous state on error
      }
    } else {
      //  FOLLOW LOGIC
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: targetUserId })

      if (error) {
        console.error("Error while following:", error.message)
        setIsFollowing(false) // Revert to previous state on error
      }
    }

    setLoading(false)
    // Refresh in background to update follow counts
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
