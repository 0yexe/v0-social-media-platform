import { createClient } from "@/lib/supabase/server"
import { Film, Heart, MessageCircle, Share2 } from "lucide-react"
import Link from "next/link"

export default async function ReelsPage() {
  const supabase = await createClient()

  // Database se sirf video waali posts fetch kar rahe hain
  const { data: reels, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Supabase Error:", error.message)
  }

  // Agar database mein koi video na mile toh yeh filter temporary hata bhi sakte hain
  // Abhi ke liye hum un posts ko dikhayenge jinme media_url maujood hai
  const videoReels = reels?.filter(post => post.media_url) || []

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-black overflow-y-scroll snap-y snap-mandatory pb-16 scrollbar-none">
      {videoReels.length > 0 ? (
        videoReels.map((reel) => (
          <div 
            key={reel.id} 
            className="w-full h-[calc(100vh-64px)] snap-start relative flex items-center justify-center bg-black border-b border-zinc-900"
          >
            {/* 🎥 Video Player (Muted rakha hai taaki autoPlay block na ho) */}
            <video
              src={reel.media_url}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              controls
              autoPlay
            />

            {/* 👤 User Profile Info Overlay (Bottom Left) */}
            <div className="absolute bottom-6 left-4 right-16 text-white z-10 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-xl">
              <Link href={`/app/profile`} className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden border border-purple-500 flex items-center justify-center">
                  {reel.profiles?.avatar_url ? (
                    <img src={reel.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-zinc-400">
                      {reel.profiles?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm drop-shadow-md">
                  @{reel.profiles?.username || "user"}
                </p>
              </Link>
              <p className="text-xs text-zinc-200 line-clamp-2 drop-shadow-sm font-medium">
                {reel.caption || "TIGR App Reel 🔥"}
              </p>
            </div>

            {/* ⚡ Action Buttons Sidebar (Right Side) */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-20 text-white">
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-zinc-900/50 rounded-full backdrop-blur-md group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-white group-hover:text-red-500 transition-colors" />
                </div>
                <span className="text-xs font-bold drop-shadow-md">Like</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-zinc-900/50 rounded-full backdrop-blur-md group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold drop-shadow-md">Comment</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-zinc-900/50 rounded-full backdrop-blur-md group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold drop-shadow-md">Share</span>
              </button>
            </div>

          </div>
        ))
      ) : (
        /* 🔔 Empty State (Jab koi video na ho) */
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 bg-zinc-950 px-6 text-center">
          <Film className="w-16 h-16 opacity-30 text-purple-500 animate-pulse" />
          <h3 className="text-lg font-bold text-zinc-200">No Reels Yet!</h3>
          <p className="text-xs text-zinc-400 max-w-xs">
            Abhi tak kisi ne video upload nahi ki hai. Aap sabse pehle naye section mein video daal kar shuruat karein!
          </p>
          <Link href="/app/create" className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-colors">
            Create First Reel
          </Link>
        </div>
      )}
    </div>
  )
}
