"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  Search,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  Settings,
  LogOut,
  User as UserIcon,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getBlobUrl } from "@/lib/blob-utils"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  username: string
  profile_pic_url: string | null
  bio: string | null
}

interface SidebarProps {
  user: User
  profile: Profile | null
}

const navItems = [
  { icon: Home, label: "Home", href: "/app" },
  { icon: Search, label: "Explore", href: "/app/explore" },
  { icon: Film, label: "Reels", href: "/app/reels" },
  { icon: MessageCircle, label: "Messages", href: "/app/messages" },
  { icon: Heart, label: "Notifications", href: "/app/notifications" },
  { icon: Users, label: "Groups", href: "/app/groups" },
  { icon: PlusSquare, label: "Create", href: "/app/create" },
]

export function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-72 border-r border-border bg-card p-6">
      {/* Logo */}
      <Link href="/app" className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">SocialApp</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative block"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className={`font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full gradient-primary"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border pt-4 space-y-3">
        <Link
          href={`/app/profile/${profile?.username || user.id}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={getBlobUrl(profile?.profile_pic_url)} />
            <AvatarFallback className="gradient-primary text-white">
              {profile?.username?.[0]?.toUpperCase() || <UserIcon className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {profile?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-xl"
            asChild
          >
            <Link href="/app/settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
