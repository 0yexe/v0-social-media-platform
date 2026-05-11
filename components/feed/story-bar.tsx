"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Story, Profile } from "@/lib/types"
import { getBlobUrl } from "@/lib/blob-utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface StoryBarProps {
  stories: (Story & { 
    profiles: Profile;
    telegram_file_id?: string;
    media_type?: string;
  })[]
  currentUserId: string
  currentUserProfile: Profile | null
}

export function StoryBar({ stories, currentUserId, currentUserProfile }: StoryBarProps) {
  const [selectedStory, setSelectedStory] = useState<any>(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // --- Story Upload Logic ---
  const handleUploadClick = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUserId) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      // 1. Prepare FormData for Telegram/Server Upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", file.type.startsWith("video/") ? "video" : "image")

      // 2. Call your upload API
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")
      const { file_id } = await res.json()

      // 3. Insert into Supabase 'stories' table
      const { error } = await supabase.from("stories").insert({
        user_id: currentUserId,
        telegram_file_id: file_id,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 Hours
      })

      if (error) throw error
      
      router.refresh() // UI refresh to show new story
    } catch (err) {
      console.error(err)
      alert("Failed to upload story. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // --- Story Viewing Logic ---
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.user_id
    if (!acc[userId]) acc[userId] = []
    acc[userId].push(story)
    return acc
  }, {} as Record<string, any[]>)

  const userIds = Object.keys(groupedStories)

  const openStory = (story: any, index: number) => {
    setSelectedStory(story)
    setStoryIndex(index)
  }

  const nextStory = () => {
    const currentUserStories = groupedStories[selectedStory.user_id]
    if (storyIndex < currentUserStories.length - 1) {
      setStoryIndex(storyIndex + 1)
      setSelectedStory(currentUserStories[storyIndex + 1])
    } else {
      const currentIndex = userIds.indexOf(selectedStory.user_id)
      if (currentIndex < userIds.length - 1) {
        const nextUserStories = groupedStories[userIds[currentIndex + 1]]
        setStoryIndex(0)
        setSelectedStory(nextUserStories[0])
      } else {
        setSelectedStory(null)
      }
    }
  }

  const getMediaUrl = (story: any) => {
    if (story.telegram_file_id) return `/api/media?fileId=${story.telegram_file_id}`
    return getBlobUrl(story.media_url)
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 overflow-x-auto no-scrollbar bg-background border-b border-border">
        {/* Your Story Icon (Upload) */}
        <div className="flex flex-col items-center gap-2 min-w-[75px] cursor-pointer" onClick={handleUploadClick}>
          <div className="relative">
            <Avatar className={`w-16 h-16 border-2 border-background ring-2 ${isUploading ? 'ring-primary animate-spin' : 'ring-muted'}`}>
              <AvatarImage src={getBlobUrl(currentUserProfile?.profile_pic_url)} />
              <AvatarFallback className="gradient-primary text-white font-bold">
                {currentUserProfile?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isUploading && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background text-white">
                <Plus className="w-4 h-4" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <span className="text-[11px] font-medium text-foreground">Your story</span>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
        </div>

        {/* Others' Stories */}
        {userIds.map((userId) => {
          const userStories = groupedStories[userId]
          const profile = userStories[0].profiles
          return (
            <div key={userId} className="flex flex-col items-center gap-2 min-w-[75px] cursor-pointer" onClick={() => openStory(userStories[0], 0)}>
              <div className="w-16 h-16 rounded-full p-[2px] ring-2 ring-primary bg-background">
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
                  <AvatarFallback>{profile?.username?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[11px] font-medium truncate w-16 text-center">{profile?.username}</span>
            </div>
          )
        })}
      </div>

      {/* Story View Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <div className="relative w-full max-w-md h-full md:h-[90vh] bg-zinc-900 rounded-lg overflow-hidden">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
                {groupedStories[selectedStory.user_id].map((_, i) => (
                  <div key={i} className="flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{ width: i === storyIndex ? "100%" : i < storyIndex ? "100%" : "0%" }}
                      transition={{ duration: i === storyIndex ? 5 : 0, ease: "linear" }}
                      onAnimationComplete={() => i === storyIndex && nextStory()}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 flex items-center gap-3 z-30">
                <Avatar className="w-8 h-8 border border-white/20"><AvatarImage src={getBlobUrl(selectedStory.profiles?.profile_pic_url)} /></Avatar>
                <span className="text-white text-sm font-bold">{selectedStory.profiles?.username}</span>
                <button onClick={() => setSelectedStory(null)} className="ml-auto p-2 text-white"><X className="w-6 h-6" /></button>
              </div>

              {/* Content */}
              <div className="w-full h-full flex items-center justify-center bg-black">
                {selectedStory.media_type === "video" ? (
                  <video src={getMediaUrl(selectedStory)} className="max-h-full w-full object-contain" autoPlay playsInline onEnded={nextStory} />
                ) : (
                  <img src={getMediaUrl(selectedStory)} className="max-h-full w-full object-contain" alt="" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
          }
                    
