"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Search, PlusSquare, Heart, User } from "lucide-react"

interface MobileNavProps {
  username?: string
}

export function MobileNav({ username }: MobileNavProps) {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, href: "/app" },
    { icon: Search, href: "/app/explore" },
    { icon: PlusSquare, href: "/app/create" },
    { icon: Heart, href: "/app/notifications" },
    { icon: User, href: "/profile"},
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50">
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/app" && pathname.startsWith(item.href)) ||
            (item.icon === User && pathname.includes("/profile"))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative p-2"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : ""}`} />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full gradient-primary"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
