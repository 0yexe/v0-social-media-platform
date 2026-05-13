import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Agar user pehle se login hai, toh use seedha Feed page par bhej do
  if (user) {
    redirect("/app")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Logo Section */}
      <div className="mb-8 animate-bounce">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Hero Text */}
      <h1 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
        TIGR
      </h1>
      <p className="text-muted-foreground max-w-[280px] mb-10 text-lg font-medium leading-relaxed">
        Muzaffarnagar ka apna naya social media platform. Join karo aur shuru karo!
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link 
          href="/login" 
          className="bg-primary text-primary-foreground h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform gap-2"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>
        
        <p className="text-xs text-muted-foreground mt-4">
          By joining, you agree to our Terms & Conditions.
        </p>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-10 opacity-20 flex gap-8 font-black italic text-4xl select-none pointer-events-none">
        <span>AI</span>
        <span>CHAT</span>
        <span>POST</span>
      </div>
    </div>
  )
}
