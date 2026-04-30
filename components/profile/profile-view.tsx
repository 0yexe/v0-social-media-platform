"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  const filteredPosts = posts.filter((p) =>
    activeTab === "reels" ? p.type === "reel" : p.type === "post"
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {profile.is_private && <Lock className="w-4 h-4 text-muted-foreground" />}
            <h1 className="text-lg font-bold">{profile.username}</h1>
          </div>
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Share profile</DropdownMenuItem>
                <DropdownMenuItem>Copy profile URL</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Block</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
              <AvatarImage src={getBlobUrl(profile.profile_pic_url)} />
              <AvatarFallback className="text-2xl gradient-primary text-white">
                {profile.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h2 className="text-xl font-bold">{profile.username}</h2>
                {!isOwnProfile && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={`rounded-xl ${!isFollowing ? "gradient-primary text-white" : ""}`}
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
                    <Button variant="outline" className="rounded-xl" asChild>
                      <Link href={`/app/messages/${profile.username}`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                )}
                {isOwnProfile && (
                  <Button variant="outline" className="rounded-xl" asChild>
                    <Link href="/app/settings/profile">Edit Profile</Link>
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <p className="font-bold text-lg">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">posts</p>
                </div>
                <button className="text-center">
                  <p className="font-bold text-lg">{followers}</p>
                  <p className="text-sm text-muted-foreground">followers</p>
                </button>
                <button className="text-center">
                  <p className="font-bold text-lg">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">following</p>
                </button>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-foreground whitespace-pre-wrap">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border">
          <div className="flex">
            {[
              { value: "posts", icon: Grid3X3, label: "Posts" },
              { value: "reels", icon: Film, label: "Reels" },
              ...(isOwnProfile
                ? [{ value: "saved", icon: Bookmark, label: "Saved" }]
                : []),
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value as "posts" | "reels" | "saved")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 border-t-2 transition-colors ${
                  activeTab === value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/app/post/${post.id}`}>
              <motion.div
                whileHover={{ opacity: 0.9 }}
                className="relative aspect-square bg-muted"
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
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
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
            <p className="text-muted-foreground text-sm">
              {isOwnProfile
                ? "Start creating and sharing your content!"
                : "This user hasn't posted anything yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
