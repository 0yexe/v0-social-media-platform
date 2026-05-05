import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

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
      {/* Desktop Sidebar - isme profile data pass ho raha hai */}
      <Sidebar user={user} profile={profile} />
      
      {/* Main Content */}
      <main className="lg:pl-72 pb-20 lg:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation - Yahan humne userId add kar diya hai */}
      <MobileNav username={profile?.username} userId={user.id} />
    </div>
  )
}
