import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
// Naye icons import kiye hain: Film (Reels ke liye)
import { Home, Film, PlusSquare, Heart, User } from "lucide-react"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // User profile fetch kar rahe hain
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar user={user} profile={profile} />
      
      {/* Main Content */}
      <main className="lg:pl-72 pb-20 lg:pb-0">
        {children}
      </main>
      
      {/* 📱 Mobile Bottom Navigation (Inline - Ab kisi dusri file ki zaroorat nahi) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-4 lg:hidden z-50">
        
        {/* 1. Home Button */}
        <Link href="/app" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <Home className="w-6 h-6" />
        </Link>
        
        {/* 2. REELS BUTTON (Search ko hata kar yahan Film icon laga diya hai) */}
        <Link href="/app/reels" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <Film className="w-6 h-6 text-primary" />
        </Link>
        
        {/* 3. Create Post Button */}
        <Link href="/app/create" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <PlusSquare className="w-6 h-6" />
        </Link>
        
        {/* 4. Likes/Notifications Button */}
        <Link href="/app/likes" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-6 h-6" />
        </Link>
        
        {/* 5. Profile Button */}
        <Link href="/app/profile" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
          <User className="w-6 h-6" />
        </Link>

      </div>
    </div>
  )
}
