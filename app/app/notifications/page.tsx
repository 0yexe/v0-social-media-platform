"use client"

import { motion } from "framer-motion"
import { Heart, MessageCircle, UserPlus, AtSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock notifications for demo
const notifications = [
  {
    id: "1",
    type: "like",
    user: { username: "sarah_design", profile_pic_url: null },
    message: "liked your photo",
    time: "2h ago",
  },
  {
    id: "2",
    type: "follow",
    user: { username: "mike_dev", profile_pic_url: null },
    message: "started following you",
    time: "5h ago",
  },
  {
    id: "3",
    type: "comment",
    user: { username: "alex_photo", profile_pic_url: null },
    message: 'commented: "Amazing shot!"',
    time: "1d ago",
  },
  {
    id: "4",
    type: "mention",
    user: { username: "emma_art", profile_pic_url: null },
    message: "mentioned you in a comment",
    time: "2d ago",
  },
]

const getIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="w-4 h-4 text-red-500" />
    case "comment":
      return <MessageCircle className="w-4 h-4 text-blue-500" />
    case "follow":
      return <UserPlus className="w-4 h-4 text-green-500" />
    case "mention":
      return <AtSign className="w-4 h-4 text-primary" />
    default:
      return null
  }
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b border-border bg-card/95 backdrop-blur-xl">
        <h1 className="text-xl font-bold">Notifications</h1>
      </header>

      {/* Notifications List */}
      <div className="max-w-xl mx-auto divide-y divide-border">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={notification.user.profile_pic_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {notification.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card flex items-center justify-center shadow-sm border border-border">
                {getIcon(notification.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-semibold">{notification.user.username}</span>{" "}
                <span className="text-muted-foreground">{notification.message}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {notification.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">
            When someone interacts with you, it will show up here
          </p>
        </div>
      )}
    </div>
  )
}
