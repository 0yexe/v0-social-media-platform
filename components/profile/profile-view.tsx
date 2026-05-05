"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, ChevronLeft, ChevronRight, Loader2, 
  Grid, Film, Bookmark, Play 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getBlobUrl, isVideoFile } from "@/lib/blob-utils"
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
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [submittingReport, setSubmittingReport] = useState(false)

  const filteredPosts = allPosts.filter((post: any) => {
    if (activeTab === "posts") return post.type !== "reel"
    if (activeTab === "reels") return post.type === "reel"
    return false
  })

  const handleReport = async () => {
    setSubmittingReport(true)
    // Add report logic here
    setTimeout(() => {
      setSubmittingReport(false)
      setShowReportModal(false)
      setReportReason("")
    }, 1000)
  }

  // Media URL nikalne ka logic (Telegram + Blob compatibility)
  const getMediaSource = (post: any) => {
    if (post.telegram_file_id) {
      return `/api/media/${post.telegram_file_id}`;
    }
    return getBlobUrl(post.media_url);
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Profile Header (Bio, Stats, etc.) */}
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
                  <Link href="/app/settings/profile">Edit Profile</Link>
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
          
          <div>
            <p className="font-semibold text-sm">{currentProfile.full_name}</p>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{currentProfile.bio || "No bio yet."}</p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex border-b border-border">
        {[
          { id: "posts", icon: Grid, label: "POSTS" },
          { id: "reels", icon: Film, label: "REELS" },
          { id: "saved", icon: Bookmark, label: "SAVED" },
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
                <img
                  src={getMediaSource(post)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                {/* Stats overlays could go here */}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-muted flex items-center justify-center mx-auto">
              {activeTab === "posts" ? <Grid className="w-8 h-8 text-muted-foreground" /> : <Film className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-xl font-bold">No {activeTab} yet</h3>
            <p className="text-muted-foreground text-sm">{isOwnProfile ? "Start sharing your content!" : "This user hasn't posted anything yet."}</p>
          </motion.div>
        )}
      </div>

      {/* Post Detail Modal */}
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
                  <video
                    src={getMediaSource(selectedPost)}
                    className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
                    controls
                    autoPlay
                    loop
                  />
                ) : (
                  <img
                    src={getMediaSource(selectedPost)}
                    alt=""
                    className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
                  />
                )}
              </div>
              
              <div className="w-full md:w-80 p-4 border-t md:border-t-0 md:border-l border-border bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={getBlobUrl(currentProfile.profile_pic_url)} />
                    <AvatarFallback className="gradient-primary text-white">
                      {currentProfile.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-sm">{currentProfile.username}</span>
                </div>
                <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
                  {selectedPost.caption && <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedPost.caption}</p>}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
