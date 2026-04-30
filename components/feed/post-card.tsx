"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Post, Profile } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/date-utils"

interface PostCardProps {
  post: Post & { profiles: Profile; likes: { user_id: string }[]; comments: { id: string }[] }
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes?.some((l) => l.user_id === currentUserId))
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleLike = async () => {
    const supabase = createClient()

    if (isLiked) {
      await supabase.from("likes").delete().match({ user_id: currentUserId, post_id: post.id })
      setLikesCount((c) => c - 1)
    } else {
      await supabase.from("likes").insert({ user_id: currentUserId, post_id: post.id })
      setLikesCount((c) => c + 1)
    }
    setIsLiked(!isLiked)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    const supabase = createClient()
    await supabase.from("comments").insert({
      user_id: currentUserId,
      post_id: post.id,
      content: comment,
    })

    setComment("")
  }

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link
          href={`/app/profile/${post.profiles?.username}`}
          className="flex items-center gap-3"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles?.profile_pic_url || undefined} />
            <AvatarFallback className="bg-secondary">
              {post.profiles?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-foreground">{post.profiles?.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(post.created_at)}
            </p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Share to...</DropdownMenuItem>
            {post.user_id === currentUserId && (
              <>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </>
            )}
            {post.user_id !== currentUserId && (
              <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="relative aspect-square bg-muted">
          {post.type === "reel" ? (
            <video
              src={post.media_url}
              className="w-full h-full object-cover"
              controls
              loop
              playsInline
            />
          ) : (
            <img
              src={post.media_url}
              alt={post.caption || "Post"}
              className="w-full h-full object-cover"
            />
          )}

          {/* Double tap to like */}
          <motion.button
            className="absolute inset-0"
            onDoubleClick={handleLike}
          />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`${isLiked ? "text-red-500" : "text-foreground"}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="text-foreground"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="text-foreground">
              <Send className="w-6 h-6" />
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSaved(!isSaved)}
            className="text-foreground"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
          </motion.button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm mb-2">
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-2">
            <Link
              href={`/app/profile/${post.profiles?.username}`}
              className="font-semibold mr-2"
            >
              {post.profiles?.username}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Comments Preview */}
        {post.comments && post.comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-muted-foreground mb-2"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Comment Input */}
        <AnimatePresence>
          {showComments && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleComment}
              className="flex items-center gap-3 pt-3 border-t border-border mt-3"
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={!comment.trim()}
                className="text-primary font-semibold"
              >
                Post
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}
