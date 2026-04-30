"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Story, Profile } from "@/lib/types"
import { getBlobUrl } from "@/lib/blob-utils"

interface StoryBarProps {
  stories: (Story & { profiles: Profile })[]
  currentUserId: string
  currentUserProfile: Profile | null
}

export function StoryBar({ stories, currentUserId, currentUserProfile }: StoryBarProps) {
  const [selectedStory, setSelectedStory] = useState<(Story & { profiles: Profile }) | null>(null)
  const [storyIndex, setStoryIndex] = useState(0)

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.user_id
    if (!acc[userId]) {
      acc[userId] = []
    }
    acc[userId].push(story)
    return acc
  }, {} as Record<string, (Story & { profiles: Profile })[]>)

  const userStories = Object.entries(groupedStories)

  const openStory = (story: Story & { profiles: Profile }, index: number) => {
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
      // Move to next user's stories
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
                <AvatarFallback className="bg-secondary text-muted-foreground">
                  {currentUserProfile?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gradient-primary flex items-center justify-center border-2 border-card">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Your story</span>
          </motion.button>

          {/* User Stories */}
          {userStories.map(([userId, userStoryList]) => {
            const profile = userStoryList[0].profiles
            const hasUnviewed = true // TODO: Track viewed stories

            return (
              <motion.button
                key={userId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openStory(userStoryList[0], 0)}
                className="flex flex-col items-center gap-2 min-w-fit"
              >
                <div className={`p-0.5 rounded-full ${hasUnviewed ? "story-ring" : "bg-muted"}`}>
                  <Avatar className="w-16 h-16 border-2 border-card">
                    <AvatarImage src={profile?.profile_pic_url || undefined} />
                    <AvatarFallback className="bg-secondary">
                      {profile?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-foreground truncate max-w-16">
                  {profile?.username}
                </span>
              </motion.button>
            )
          })}

          {/* Empty State */}
          {userStories.length === 0 && (
            <div className="flex items-center gap-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                  <div className="w-12 h-3 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          )}
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
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeStory}
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Story Content */}
            <div className="relative w-full max-w-lg h-full max-h-[90vh] mx-4">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                {groupedStories[selectedStory.user_id].map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                    <motion.div
                      initial={{ width: i < storyIndex ? "100%" : "0%" }}
                      animate={{ width: i <= storyIndex ? "100%" : "0%" }}
                      transition={{ duration: i === storyIndex ? 5 : 0 }}
                      onAnimationComplete={() => {
                        if (i === storyIndex) nextStory()
                      }}
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* User Info */}
              <div className="absolute top-10 left-4 flex items-center gap-3 z-10">
                <Avatar className="w-10 h-10 border-2 border-white">
                  <AvatarImage src={selectedStory.profiles?.profile_pic_url || undefined} />
                  <AvatarFallback>
                    {selectedStory.profiles?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {selectedStory.profiles?.username}
                  </p>
                  <p className="text-white/70 text-xs">
                    {new Date(selectedStory.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Story Image */}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={getBlobUrl(selectedStory.media_url)}
                  alt="Story"
                  className="max-w-full max-h-full object-contain rounded-2xl"
                />
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevStory}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full"
              />
              <button
                onClick={nextStory}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-2/3 h-full"
              />

              {/* Navigation Arrows */}
              {storyIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevStory}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={nextStory}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
