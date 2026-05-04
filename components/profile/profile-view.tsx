"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Grid3X3,
  Bookmark,
  Film,
  Settings,
  MessageCircle,
  UserPlus,
  UserMinus,
  Lock,
  MoreHorizontal,
  Flag,
  Share2,
  Link as LinkIcon,
  Camera,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Profile, Post } from "@/lib/types"
import { getBlobUrl, isVideoFile } from "@/lib/blob-utils"

interface ProfileViewProps {
  profile: Profile
  posts: (Post & { likes: { count: number }[]; comments: { count: number }[] })[]
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isOwnProfile: boolean
  currentUserId: string
}

export function ProfileView({
  profile,
  posts,
  followersCount,
  followingCount,
  isFollowing: initialIsFollowing,
  isOwnProfile,
  currentUserId,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "saved">("posts")
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followers, setFollowers] = useState(followersCount)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [submittingReport, setSubmittingReport] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [currentProfile, setCurrentProfile] = useState(profile)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFollow = async () => {
    const supabase = createClient()

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .match({ follower_id: currentUserId, following_id: profile.id })
      setFollowers((c) => c - 1)
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: profile.id,
      })
      setFollowers((c) => c + 1)
    }
    setIsFollowing(!isFollowing)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isOwnProfile) return

    setUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "avatars")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { pathname } = await response.json()

      const supabase = createClient()
      await supabase
        .from("profiles")
        .update({ profile_pic_url: pathname })
        .eq("id", profile.id)

      setCurrentProfile({ ...currentProfile, profile_pic_url: pathname })
    } catch (error) {
      console.error("Photo upload error:", error)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) return
    setSubmittingReport(true)
    
    // Here you would typically save the report to the database
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmittingReport(false)
    setShowReportModal(false)
    setReportReason("")
  }

  const handleCopyProfileUrl = () => {
    navigator.clipboard.writeText(window.location.href)
  }

  const filteredPosts = posts.filter((p) =>
    activeTab === "reels" ? p.type === "reel" : p.type === "post"
  )

  const tabs = [
    { value: "posts" as const, icon: Grid3X3, label: "Posts" },
    { value: "reels" as const, icon: Film, label: "Reels" },
    ...(isOwnProfile
      ? [{ value: "saved" as const, icon: Bookmark, label: "Saved" }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {currentProfile.is_private && (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
            <h1 className="text-lg font-bold">{currentProfile.username}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <Link href="/app/settings">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleCopyProfileUrl}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy profile URL
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Block user
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowReportModal(true)}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report user
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start gap-6 mb-6">
            {/* Profile Picture */}
            <div className="relative">
              <motion.div
                whileHover={isOwnProfile ? { scale: 1.02 } : undefined}
                whileTap={isOwnProfile ? { scale: 0.98 } : undefined}
              >
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-card shadow-xl ring-2 ring-primary/20">
                  <AvatarImage src={getBlobUrl(currentProfile.profile_pic_url)} />
                  <AvatarFallback className="text-3xl gradient-primary text-white">
                    {currentProfile.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {/* Upload Photo Button */}
              {isOwnProfile && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg border-2 border-card"
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </motion.button>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Username and Actions */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h2 className="text-xl font-bold truncate">{currentProfile.username}</h2>
                {!isOwnProfile && (
                  <div className="flex gap-2 flex-wrap">
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className={`rounded-xl ${!isFollowing ? "gradient-primary text-white border-0" : ""}`}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="rounded-xl" asChild>
                        <Link href={`/app/messages/${currentProfile.username}`}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                )}
                {isOwnProfile && (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" className="rounded-xl" asChild>
                      <Link href="/app/settings">Edit Profile</Link>
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center cursor-pointer"
                >
                  <p className="font-bold text-lg">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">posts</p>
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <p className="font-bold text-lg">{followers}</p>
                  <p className="text-sm text-muted-foreground">followers</p>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <p className="font-bold text-lg">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">following</p>
                </motion.button>
              </div>

              {/* Bio */}
              {currentProfile.bio && (
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {currentProfile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border sticky top-16 bg-card/95 backdrop-blur-xl z-10">
          <div className="flex">
            {tabs.map(({ value, icon: Icon, label }) => (
              <motion.button
                key={value}
                onClick={() => setActiveTab(value)}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 border-t-2 transition-colors ${
                  activeTab === value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ opacity: 0.9 }}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square bg-muted cursor-pointer overflow-hidden"
            >
              {post.media_url && (
                post.type === "reel" || isVideoFile(post.media_url) ? (
                  <video
                    src={getBlobUrl(post.media_url)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getBlobUrl(post.media_url)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )
              )}
              {post.type === "reel" && (
                <div className="absolute top-2 right-2">
                  <Film className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
              )}
              
              {/* Hover Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 text-white"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {post.likes?.[0]?.count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-5 h-5 fill-current" />
                  {post.comments?.[0]?.count || 0}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              {activeTab === "posts" ? (
                <Grid3X3 className="w-10 h-10 text-muted-foreground" />
              ) : activeTab === "reels" ? (
                <Film className="w-10 h-10 text-muted-foreground" />
              ) : (
                <Bookmark className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === "saved" ? "No saved posts" : "No posts yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {isOwnProfile
                ? "Start creating and sharing your content with the world!"
                : "This user hasn't posted anything yet."}
            </p>
            {isOwnProfile && activeTab === "posts" && (
              <Button className="mt-6 rounded-xl gradient-primary text-white" asChild>
                <Link href="/app/create">Create your first post</Link>
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
            <DialogDescription>
              Tell us why you want to report this user. Our team will review your report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Describe the issue..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowReportModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={!reportReason.trim() || submittingReport}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {submittingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full bg-card rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Media */}
              <div className="flex-1 bg-black flex items-center justify-center">
                {selectedPost.media_url && (
                  selectedPost.type === "reel" || isVideoFile(selectedPost.media_url) ? (
                    <video
                      src={getBlobUrl(selectedPost.media_url)}
                      className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
                      controls
                      autoPlay
                      loop
                    />
                  ) : (
                    <img
                      src={getBlobUrl(selectedPost.media_url)}
                      alt=""
                      className="max-w-full max-h-[60vh] md:max-h-[90vh] object-contain"
                    />
                  )
                )}
              </div>
              
              {/* Post Info */}
              <div className="w-full md:w-80 p-4 border-t md:border-t-0 md:border-l border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getBlobUrl(currentProfile.profile_pic_url)} />
                    <AvatarFallback className="gradient-primary text-white">
                      {currentProfile.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{currentProfile.username}</span>
                </div>
                {selectedPost.caption && (
                  <p className="text-sm whitespace-pre-wrap">{selectedPost.caption}</p>
                )}
              </div>
            </motion.div>
            
            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id)
                if (currentIndex > 0) {
                  setSelectedPost(filteredPosts[currentIndex - 1])
                }
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const currentIndex = filteredPosts.findIndex(p => p.id === selectedPost.id)
                if (currentIndex < filteredPosts.length - 1) {
                  setSelectedPost(filteredPosts[currentIndex + 1])
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
