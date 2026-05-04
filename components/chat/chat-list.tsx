"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Edit, Users, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "@/lib/date-utils"
import type { Profile, Group, Message } from "@/lib/types"

interface ChatItem {
  id: string
  profile?: Profile
  group?: Group
  lastMessage: Message | null
  type: "dm" | "group"
}

interface ChatListProps {
  items: ChatItem[]
  currentUserId: string
}

export function ChatList({ items, currentUserId }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "dm" | "group">("all")

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter
    const matchesSearch =
      !searchQuery ||
      (item.type === "dm"
        ? item.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        : item.group?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-screen">
      {/* Header */}
      <header className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Edit className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/50 border-0"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-3">
          {[
            { value: "all", label: "All" },
            { value: "dm", label: "Direct" },
            { value: "group", label: "Groups" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as "all" | "dm" | "group")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Link
              key={item.id}
              href={
                item.type === "dm"
                  ? `/app/messages/${item.profile?.username}`
                  : `/app/messages/group/${item.group?.id}`
              }
            >
              <motion.div
                whileHover={{ backgroundColor: "var(--secondary)" }}
                className="flex items-center gap-3 p-4 border-b border-border cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={
                      item.type === "dm"
                        ? item.profile?.profile_pic_url || undefined
                        : item.group?.avatar_url || undefined
                    }
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {item.type === "dm" ? (
                      item.profile?.username?.[0]?.toUpperCase() || <User className="w-6 h-6" />
                    ) : (
                      <Users className="w-6 h-6" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground truncate">
                      {item.type === "dm" ? item.profile?.username : item.group?.name}
                    </p>
                    {item.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(item.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.lastMessage?.is_unsent
                      ? "Message deleted"
                      : item.lastMessage?.content || "No messages yet"}
                  </p>
                </div>

                {/* Unread indicator */}
                {item.lastMessage && !item.lastMessage.is_read && item.lastMessage.sender_id !== currentUserId && (
                  <div className="w-3 h-3 rounded-full gradient-primary" />
                )}
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Edit className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-sm">
              Start a conversation with someone!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
