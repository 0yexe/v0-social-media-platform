"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getBlobUrl } from "@/lib/blob-utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface StoryBarProps {
  stories: any[]
  currentUserId: string
  currentUserProfile: any
}

export function StoryBar({ stories, currentUserId, currentUserProfile }: StoryBarProps) {
  const [selectedStory, setSelectedStory] = useState<any>(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // --- Group Stories by User ---
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.user_id
    if (!acc[userId]) acc[userId] = []
    acc[userId].push(story)
    return acc
  }, {} as Record<string, any[]>)

  const userIds = Object.keys(groupedStories)

  // --- Upload Logic ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUserId) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", file.type.startsWith("video/") ? "video" : "image")

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { file_id } = await res.json()

      const { error } = await supabase.from("stories").insert({
        user_id: currentUserId,
        telegram_file_id: file_id,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      if (error) throw error
      router.refresh()
      setSelectedStory(null) // Modal close after upload
    } catch (err) {
      alert("Error uploading story!")
    } finally {
      setIsUploading(false)
    }
  }

  // --- Navigation Logic ---
  const nextStory = () => {
    const currentUserStories = groupedStories[selectedStory.user_id]
    if (storyIndex < currentUserStories.length - 1) {
      setStoryIndex(prev => prev + 1)
      setSelectedStory(currentUserStories[storyIndex + 1])
    } else {
      const currentIndex = userIds.indexOf(selectedStory.user_id)
      if (currentIndex < userIds.length - 1) {
        setStoryIndex(0)
        setSelectedStory(groupedStories[userIds[currentIndex + 1]][0])
      } else {
        setSelectedStory(null)
      }
    }
  }

  const prevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1)
      setSelectedStory(groupedStories[selectedStory.user_id][storyIndex - 1])
    }
  }

  const getMediaUrl = (story: any) => {
    if (story.telegram_file_id) return `/api/media?fileId=${story.telegram_file_id}`
    return getBlobUrl(story.media_url)
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 overflow-x-auto no-scrollbar bg-background border-b border-border">
        {/* Your Story Icon */}
        <div className="flex flex-col items-center gap-2 min-w-[75px] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="relative">
            <Avatar className={`w-16 h-16 border-2 border-background ring-2 ${isUploading ? 'ring-primary animate-pulse' : 'ring-muted'}`}>
              <AvatarImage src={getBlobUrl(currentUserProfile?.profile_pic_url)} />
              <AvatarFallback className="gradient-primary text-white font-bold">{currentUserProfile?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              {isUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Plus className="w-3 h-3 text-white" />}
            </div>
          </div>
          <span className="text-[11px] font-medium">Your story</span>
        </div>

        {/* User Stories */}
        {userIds.map((userId) => {
          const userStoryList = groupedStories[userId]
          const profile = userStoryList[0].profiles
          return (
            <div key={userId} className="flex flex-col items-center gap-2 min-w-[75px] cursor-pointer" onClick={() => { setSelectedStory(userStoryList[0]); setStoryIndex(0); }}>
              <div className="w-16 h-16 rounded-full p-[2px] ring-2 ring-primary">
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

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            
            <div className="relative w-full max-w-md h-full md:h-[90vh] bg-zinc-900 md:rounded-xl overflow-hidden">
              {/* Top Progress Bars */}
              <div className="absolute top-4 left-2 right-2 flex gap-1 z-50">
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

              {/* Header: Profile & Add More Button */}
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarImage src={getBlobUrl(selectedStory.profiles?.profile_pic_url)} />
                  </Avatar>
                  <span className="text-white text-sm font-bold">{selectedStory.profiles?.username}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedStory.user_id === currentUserId && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setSelectedStory(null)} className="p-2 text-white"><X className="w-6 h-6" /></button>
                </div>
              </div>

              {/* Content Area */}
              <div className="w-full h-full flex items-center justify-center">
                {selectedStory.media_type === "video" ? (
                  <video src={getMediaUrl(selectedStory)} className="w-full h-full object-contain" autoPlay playsInline onEnded={nextStory} />
                ) : (
                  <img src={getMediaUrl(selectedStory)} className="w-full h-full object-contain" alt="" />
                )}
              </div>

              {/* Navigation Click Areas */}
              <div className="absolute inset-0 flex z-40">
                <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
                <div className="w-2/3 h-full cursor-pointer" onClick={nextStory} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
