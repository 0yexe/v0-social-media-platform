"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Grid, Film, Play, Trash2, Loader2, Plus, MoreHorizontal 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getBlobUrl, isVideoFile } from "@/lib/blob-utils"
import { deletePost } from "@/lib/actions"
import Link from "next/link"

export function ProfileView({
  profile,
  posts: allPosts,
  highlights,
  followersCount,
  followingCount,
  isFollowing,
  isOwnProfile,
  currentUserId,
}: any) {
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredPosts = allPosts.filter((post: any) => {
    if (activeTab === "posts") return post.type !== "reel"
    if (activeTab === "reels") return post.type === "reel"
    return false
  })

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Bhai, kya sach mein ye post delete karni hai?")) return
    setIsDeleting(true)
    try {
      await deletePost(postId)
      setSelectedPost(null)
    } catch (error) {
      alert("Error deleting post!")
    } finally {
      setIsDeleting(false)
    }
  }

  const getMediaSource = (post: any) => {
    if (post.telegram_file_id) return `/api/media?fileId=${post.telegram_file_id}`
    return getBlobUrl(post.media_url)
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 bg-background min-h-screen">
      {/* 1. Header Section (Bio Fix) */}
      <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-border">
        <div className="relative group">
          <Avatar className="w-24 h-24 md:w-36 md:h-36 border-4 border-background shadow-xl">
            <AvatarImage src={getBlobUrl(profile.profile_pic_url)} />
            <AvatarFallback className="text-3xl gradient-primary text-white font-bold">
              {profile.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-5 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <h1 className="text-2xl font-light tracking-tight">{profile.username}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" className="rounded-md font-semibold px-6" asChild>
                  <Link href="/app/settings">Edit Profile</Link>
                </Button>
              ) : (
                <Button size="sm" className={`rounded-md px-8 font-semibold ${isFollowing ? "bg-secondary" : "gradient-primary text-white"}`}>
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start gap-10 text-base">
            <span><strong>{allPosts.length}</strong> posts</span>
            <span className="cursor-pointer"><strong>{followersCount}</strong> followers</span>
            <span className="cursor-pointer"><strong>{followingCount}</strong> following</span>
          </div>
          
          <div className="space-y-1">
            <p className="font-bold text-sm">{profile.full_name}</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {profile.bio || "No bio yet. Tap Edit Profile to add one!"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Highlights Section (Instagram Style Circles) */}
      <div className="flex gap-6 overflow-x-auto py-6 px-4 no-scrollbar border-b border-border">
        {highlights?.map((h: any) => (
          <div key={h.id} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] border border-muted-foreground/30 group-hover:border-primary transition-all">
              <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                <img src={h.cover_url || "/placeholder-highlight.png"} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            <span className="text-[11px] font-medium truncate w-20 text-center">{h.title}</span>
          </div>
        ))}
        
        {isOwnProfile && (
          <div className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-muted-foreground/30 flex items-center justify-center group-hover:border-primary transition-all">
              <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">New</span>
          </div>
        )}
      </div>

      {/* 3. Tabs Section */}
      <div className="flex justify-center">
        {[
          { id: "posts", icon: Grid, label: "POSTS" },
          { id: "reels", icon: Film, label: "REELS" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-12 py-4 flex items-center gap-2 text-xs font-bold tracking-widest transition-all ${
              activeTab === tab.id ? "border-t-2 border-foreground text-foreground" : "text-muted-foreground opacity-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Grid View */}
      <div className="grid grid-cols-3 gap-1 md:gap-2 p-1 md:p-2">
        {filteredPosts.map((post: any) => (
          <motion.div
            key={post.id}
            whileHover={{ opacity: 0.9 }}
            className="relative aspect-square cursor-pointer group bg-muted overflow-hidden"
            onClick={() => setSelectedPost(post)}
          >
            {post.media_type === "video" || post.type === "reel" ? (
              <video src={getMediaSource(post)} className="w-full h-full object-cover" />
            ) : (
              <img src={getMediaSource(post)} className="w-full h-full object-cover" />
            )}
          </motion.div>
        ))}
      </div>

      {/* 5. Detail Modal (Delete Button Included) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedPost(null)}>
            <motion.div 
              className="max-w-4xl w-full bg-card rounded-sm overflow-hidden flex flex-col md:flex-row h-[80vh]" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-[1.5] bg-black flex items-center justify-center relative">
                {selectedPost.media_type === "video" ? (
                  <video src={getMediaSource(selectedPost)} className="max-h-full" controls autoPlay />
                ) : (
                  <img src={getMediaSource(selectedPost)} className="max-h-full object-contain" alt="" />
                )}
              </div>
              <div className="flex-1 flex flex-col bg-background border-l border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8"><AvatarImage src={getBlobUrl(profile.profile_pic_url)} /></Avatar>
                    <span className="font-bold text-sm">{profile.username}</span>
                  </div>
                  {isOwnProfile && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedPost.id)} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                    </Button>
                  )}
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                  <p className="text-sm leading-relaxed">{selectedPost.caption}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
