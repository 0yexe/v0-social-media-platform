// components/follow-button.tsx
"use client"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function FollowButton({ targetUserId, currentUserId, initialIsFollowing }: any) {
  const router = useRouter()
  const supabase = createClient()

  const handleToggleFollow = async () => {
    if (initialIsFollowing) {
      // UNFOLLOW logic
      await supabase
        .from("follows")
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId })
    } else {
      // FOLLOW logic
      await supabase
        .from("follows")
        .insert({ follower_id: currentUserId, following_id: targetUserId })
    }
    // Page refresh karo taaki count aur button turant update ho jaye
    router.refresh()
  }

  return (
    <button 
      onClick={handleToggleFollow}
      className={`px-6 py-1.5 rounded-full font-bold text-sm ${
        initialIsFollowing ? "bg-muted text-foreground" : "gradient-primary text-white"
      }`}
    >
      {initialIsFollowing ? "Following" : "Follow"}
    </button>
  )
}
