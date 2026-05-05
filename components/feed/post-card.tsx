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
import { getBlobUrl, isVideoFile } from "@/lib/blob-utils"

interface PostCardProps {
  post: Post & { 
    profiles: Profile; 
    likes: { user_id: string }[]; 
    comments: { id: string }[];
    telegram_file_id?: string; // Naya field
    media_type?: string;      // Naya field
  }
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

  // Telegram Proxy URL generate karne ka function
  const getMediaUrl = () => {
    if (post.telegram_file_id) {
      return `/api/media/${post.telegram_file_id}`;
    }
    return getBlobUrl(post.media_url);
  };

  const isVideo = post.telegram_file_id 
    ? post.media_type === 'video' 
    : (post.type === "reel" || isVideoFile(post.media_url));

  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/app/profile/${post.profiles?.username}`} className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={getBlobUrl(post.profiles?.profile_pic_url)} />
            <AvatarFallback className="bg-secondary">
              {post.profiles?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-foreground">{post.profiles?.username}</p>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(post.created_at)}</p>
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
            {post.user_id === currentUserId && (
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Media Rendering Section (Telegram + Vercel Blob) */}
      <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
        {isVideo ? (
          <video
            src={getMediaUrl()}
            className="w-full h-full object-cover"
            controls
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={getMediaUrl()}
            alt={post.caption || "Post"}
            className="w-full h-full object-cover"
          />
        )}
        <motion.button className="absolute inset-0" onDoubleClick={handleLike} />
      </div>

      {/* Actions & Footer */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className={isLiked ? "text-red-500" : "text-foreground"}>
              <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="w-6 h-6" />
            </button>
            <Send className="w-6 h-6 cursor-pointer" />
          </div>
          <Bookmark className={`w-6 h-6 cursor-pointer ${isSaved ? "fill-current" : ""}`} onClick={() => setIsSaved(!isSaved)} />
        </div>

        <p className="font-semibold text-sm mb-2">{likesCount} likes</p>
        
        {post.caption && (
          <p className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.profiles?.username}</span>
            {post.caption}
          </p>
        )}

        {post.comments && post.comments.length > 0 && (
          <button onClick={() => setShowComments(!showComments)} className="text-sm text-muted-foreground">
            View all {post.comments.length} comments
          </button>
        )}
      </div>
    </article>
  )
}
