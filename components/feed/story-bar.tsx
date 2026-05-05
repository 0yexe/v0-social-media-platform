"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Story, Profile } from "@/lib/types"
import { getBlobUrl } from "@/lib/blob-utils"

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
  const [selectedStory, setSelectedStory] = useState<(Story & { profiles: Profile; telegram_file_id?: string; media_type?: string }) | null>(null)
  const [storyIndex, setStoryIndex] = useState(0)

  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.user_id
    if (!acc[userId]) acc[userId] = []
    acc[userId].push(story)
    return acc
  }, {} as Record<string, (Story & { profiles: Profile; telegram_file_id?: string; media_type?: string })[]>)

  const userStories = Object.entries(groupedStories)

  const openStory = (story: any, index: number) => {
    setSelectedStory(story)
    setStoryIndex(index)
  }

  const closeStory = () => {
    setSelectedStory(null)
    setStoryIndex(0)
  }

  const nextStory = () => {
    const currentUserStories = groupedStories[selectedStory!.user_id]
    if (storyIndex < currentUserStories.length - 1) {
      setStoryIndex(storyIndex + 1)
      setSelectedStory(currentUserStories[storyIndex + 1])
    } else {
      const userIds = Object.keys(groupedStories)
      const currentUserIndex = userIds.indexOf(selectedStory!.user_id)
      if (currentUserIndex < userIds.length - 1) {
        const nextUserId = userIds[currentUserIndex + 1]
        setStoryIndex(0)
        setSelectedStory(groupedStories[nextUserId][0])
      } else {
        closeStory()
      }
    }
  }

  const prevStory = () => {
    if (storyIndex > 0) {
      const currentUserStories = groupedStories[selectedStory!.user_id]
      setStoryIndex(storyIndex - 1)
      setSelectedStory(currentUserStories[storyIndex - 1])
    }
  }

  // Media URL nikalne ka logic (Telegram Proxy Support)
  const getStoryMediaUrl = (story: any) => {
    if (story.telegram_file_id) {
      return `/api/media/${story.telegram_file_id}`;
    }
    return getBlobUrl(story.media_url);
  }

  return (
    <>
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-4 p-4 overflow-x-auto scrollbar-hide">
          {/* Add Story Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 min-w-fit"
          >
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-muted">
                <AvatarImage src={currentUserProfile?.profile_pic_url || undefined} />
                <AvatarFallback className="bg-secondary">
                  {currentUserProfile?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Your story</span>
          </motion.button>

          {/* User Stories List */}
          {userStories.map(([userId, userStoryList]) => {
            const profile = userStoryList[0].profiles
            return (
              <motion.button
                key={userId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openStory(userStoryList[0], 0)}
                className="flex flex-col items-center gap-2 min-w-fit"
              >
                <div className="p-0.5 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background">
                  <Avatar className="w-16 h-16 border-2 border-card">
                    <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
                    <AvatarFallback className="bg-secondary">
                      {profile?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-foreground truncate max-w-16">{profile?.username}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={closeStory}
              className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>

            <div className="relative w-full max-w-lg h-full max-h-[95vh] mx-4 overflow-hidden rounded-2xl bg-zinc-900">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {groupedStories[selectedStory.user_id].map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: i === storyIndex ? "100%" : i < storyIndex ? "100%" : "0%" }}
                      transition={{ duration: i === storyIndex ? 5 : 0, ease: "linear" }}
                      onAnimationComplete={() => { if (i === storyIndex) nextStory() }}
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* User Info */}
              <div className="absolute top-10 left-4 flex items-center gap-3 z-20">
                <Avatar className="w-9 h-9 border-2 border-white shadow-lg">
                  <AvatarImage src={getBlobUrl(selectedStory.profiles?.profile_pic_url)} />
                  <AvatarFallback>{selectedStory.profiles?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-bold text-sm drop-shadow-md">{selectedStory.profiles?.username}</p>
                  <p className="text-white/80 text-[10px] uppercase font-medium tracking-wider">
                    {new Date(selectedStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Story Media Content (Image or Video) */}
              <div className="w-full h-full flex items-center justify-center bg-black">
                {selectedStory.media_type === 'video' || selectedStory.telegram_file_id && selectedStory.media_type === 'video' ? (
                  <video
                    key={getStoryMediaUrl(selectedStory)}
                    src={getStoryMediaUrl(selectedStory)}
                    className="w-full h-full object-contain"
                    autoPlay
                    playsInline
                    onEnded={nextStory}
                  />
                ) : (
                  <img
                    src={getStoryMediaUrl(selectedStory)}
                    alt="Story Content"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Navigation Invisible Touch Areas */}
              <button onClick={prevStory} className="absolute left-0 top-0 w-1/4 h-full z-10" />
              <button onClick={nextStory} className="absolute right-0 top-0 w-3/4 h-full z-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
