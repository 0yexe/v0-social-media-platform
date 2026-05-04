"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Film, Heart, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Post, Profile } from "@/lib/types"

interface ExploreGridProps {
  posts: (Post & { profiles: Profile; likes: { count: number }[]; comments: { count: number }[] })[]
}

export function ExploreGrid({ posts }: ExploreGridProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = posts.filter((post) =>
    post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <header className="sticky top-0 z-10 p-4 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search posts, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-muted/50 border-0 text-base"
            />
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-0.5">
          {filteredPosts.map((post, index) => {
            // Create varied grid sizes for visual interest
            const isLarge = index % 9 === 0 || index % 9 === 4

            return (
              <Link
                key={post.id}
                href={`/app/post/${post.id}`}
                className={isLarge ? "col-span-2 row-span-2" : ""}
              >
                <motion.div
                  whileHover={{ opacity: 0.9 }}
                  className="relative aspect-square bg-muted group"
                >
                  {post.media_url && (
                    post.type === "reel" ? (
                      <video
                        src={post.media_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={post.media_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-white">
                      <Heart className="w-5 h-5 fill-white" />
                      <span className="font-semibold">
                        {post.likes?.[0]?.count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span className="font-semibold">
                        {post.comments?.[0]?.count || 0}
                      </span>
                    </div>
                  </div>

                  {/* Reel indicator */}
                  {post.type === "reel" && (
                    <div className="absolute top-2 right-2">
                      <Film className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              Try searching for something else
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
