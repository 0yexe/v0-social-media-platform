"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, ChevronLeft, ChevronRight, Loader2, 
  Grid, Film, Bookmark, Play, Trash2 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getBlobUrl, isVideoFile } from "@/lib/blob-utils"
import { deletePost } from "@/lib/actions" // 1. Action import kiya
import Link from "next/link"

export function ProfileView({
  profile: currentProfile,
  posts: allPosts,
  followersCount,
  followingCount,
  isFollowing,
  isOwnProfile,
  currentUserId,
}: any) {
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("posts")
  const [isDeleting, setIsDeleting] = useState(false) // 2. Loading state

  const filteredPosts = allPosts.filter((post: any) => {
    if (activeTab === "posts") return post.type !== "reel"
    if (activeTab === "reels") return post.type === "reel"
    return false
  })

  // 3. Delete handle karne ka function
  const handleDelete = async (postId: string) => {
    if (!window.confirm("Bhai, kya sach mein ye post delete karni hai?")) return

    setIsDeleting(true)
    try {
      await deletePost(postId)
      setSelectedPost(null) // Modal band karein
      // revalidatePath kaam karega toh page khud refresh ho jayega
    } catch (error) {
      alert("Delete karne mein error aaya!")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getMediaSource = (post: any) => {
    if (post.telegram_file_id) {
      return `/api/media?fileId=${post.telegram_file_id}`;
    }
    return getBlobUrl(post.media_url);
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Profile Header */}
      <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-border">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-border">
          <AvatarImage src={getBlobUrl(currentProfile.profile_pic_url)} />
          <AvatarFallback className="text-2xl gradient-primary text-white">
            {currentProfile.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <h1 className="text-xl font-bold">{currentProfile.username}</h1>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="secondary" size="sm" className="rounded-xl" asChild>
                  <Link href="/app/settings">Edit Profile</Link>
                </Button>
              ) : (
                <Button size="sm" className={`rounded-xl ${isFollowing ? "bg-secondary" : "gradient-primary text-white"}`}>
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start gap-8 text-sm">
            <span><strong>{allPosts.length}</strong> posts</span>
            <span><strong>{followersCount}</strong> followers</span>
            <span><strong>{followingCount}</strong> following</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex border-b border-border">
        {[
          { id: "posts", icon: Grid, label: "POSTS" },
          { id: "reels", icon: Film, label: "REELS" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold tracking-widest transition-colors ${
              activeTab === tab.id ? "border-t-2 border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-3 gap-1 md:gap-4 p-1 md:p-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post: any) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 0.98 }}
              className="relative aspect-square cursor-pointer group bg-muted overflow-hidden rounded-md"
              onClick={() => setSelectedPost(post)}
            >
              {post.media_type === "video" || post.type === "reel" || isVideoFile(post.media_url) ? (
                <div className="w-full h-full relative">
                  <video src={getMediaSource(post)} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 z-10">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
              ) : (
                <img src={getMediaSource(post)} alt="post" className="w-full h-full object-cover" />
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 py-20 text-center">
            <p className="text-muted-foreground">No {activeTab} yet.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedPost(null)}
          >
            <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full z-[60]">
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-card rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] shadow-2xl"
            >
              <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
                {selectedPost.media_type === "video" || selectedPost.type === "reel" || isVideoFile(selectedPost.media_url) ? (
                  <video src={getMediaSource(selectedPost)} className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain" controls autoPlay loop />
                ) : (
                  <img src={getMediaSource(selectedPost)} alt="" className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain" />
                )}
              </div>
              
              <div className="w-full md:w-80 p-4 bg-card border-t md:border-t-0 md:border-l border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarImage src={getBlobUrl(currentProfile.profile_pic_url)} />
                      <AvatarFallback>{currentProfile.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-sm">{currentProfile.username}</span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto mb-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedPost.caption}</p>
                  </div>
                </div>

                {/* 4. DELETE BUTTON SECTION */}
                {isOwnProfile && (
                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="destructive" 
                      className="w-full gap-2 rounded-xl"
                      disabled={isDeleting}
                      onClick={() => handleDelete(selectedPost.id)}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {isDeleting ? "Deleting..." : "Delete Post"}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
