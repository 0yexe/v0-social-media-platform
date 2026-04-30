"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Image,
  Smile,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { formatTime } from "@/lib/date-utils"
import type { Profile, Message, Group } from "@/lib/types"

interface ChatRoomProps {
  currentUser: { id: string; profile: Profile | null }
  otherUser?: Profile
  group?: Group
  initialMessages: (Message & { profiles: Profile })[]
  type: "dm" | "group"
}

export function ChatRoom({
  currentUser,
  otherUser,
  group,
  initialMessages,
  type,
}: ChatRoomProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Subscribe to new messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter:
            type === "dm"
              ? `or(and(sender_id=eq.${currentUser.id},receiver_id=eq.${otherUser?.id}),and(sender_id=eq.${otherUser?.id},receiver_id=eq.${currentUser.id}))`
              : `group_id=eq.${group?.id}`,
        },
        async (payload) => {
          // Fetch the message with profile
          const { data } = await supabase
            .from("messages")
            .select(`*, profiles:sender_id(*)`)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as Message & { profiles: Profile }])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUser.id, otherUser?.id, group?.id, type])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const supabase = createClient()

    try {
      const messageData = {
        sender_id: currentUser.id,
        content: newMessage,
        ...(type === "dm"
          ? { receiver_id: otherUser?.id }
          : { group_id: group?.id }),
      }

      await supabase.from("messages").insert(messageData)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const handleUnsend = async (messageId: string) => {
    const supabase = createClient()
    await supabase
      .from("messages")
      .update({ is_unsent: true, content: "This message was deleted" })
      .eq("id", messageId)

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, is_unsent: true, content: "This message was deleted" }
          : msg
      )
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/app/messages")}
          className="lg:hidden rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Link
          href={
            type === "dm"
              ? `/app/profile/${otherUser?.username}`
              : `/app/groups/${group?.id}`
          }
          className="flex items-center gap-3 flex-1"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={
                type === "dm"
                  ? otherUser?.profile_pic_url || undefined
                  : group?.avatar_url || undefined
              }
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {type === "dm"
                ? otherUser?.username?.[0]?.toUpperCase()
                : group?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">
              {type === "dm" ? otherUser?.username : group?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {type === "dm" ? "Active now" : `${group?.is_restricted ? "Restricted" : "Open"} group`}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Video className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View profile</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Block user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isOwn = message.sender_id === currentUser.id
            const showAvatar =
              !isOwn &&
              (index === 0 || messages[index - 1].sender_id !== message.sender_id)

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
              >
                {!isOwn && (
                  <div className="w-8">
                    {showAvatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.profiles?.profile_pic_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {message.profiles?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                <div
                  className={`group relative max-w-[70%] ${
                    isOwn ? "order-1" : "order-2"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.is_unsent
                        ? "bg-muted text-muted-foreground italic"
                        : isOwn
                        ? "gradient-primary text-white"
                        : "bg-muted text-foreground"
                    } ${
                      isOwn ? "rounded-br-md" : "rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>

                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                    {isOwn && !message.is_unsent && (
                      message.is_read ? (
                        <CheckCheck className="w-3 h-3 text-primary" />
                      ) : (
                        <Check className="w-3 h-3 text-muted-foreground" />
                      )
                    )}
                  </div>

                  {/* Unsend option */}
                  {isOwn && !message.is_unsent && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleUnsend(message.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Unsend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-3"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full shrink-0"
          >
            <Image className="w-5 h-5" />
          </Button>

          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="pr-12 h-12 rounded-full bg-muted/50 border-0 focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || sending}
            className="rounded-full gradient-primary text-white shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
