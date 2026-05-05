"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, X, Loader2, Image as ImageIcon, Film, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client" // Apna path check kar lein

export default function CreatePage() {
  const [type, setType] = useState<"post" | "reel" | "story">("post")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // 1. File select aur Duration Check logic
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (type === "reel" && selectedFile.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = async () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          alert("Bhai, Reel sirf 1 minute tak ki hi upload kar sakte hain!");
          e.target.value = '';
          return;
        }
        setFile(selectedFile)
        setPreview(URL.createObjectURL(selectedFile))
      };
      video.src = URL.createObjectURL(selectedFile);
    } else {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  // 2. Share/Upload logic (Telegram + Supabase)
  const handleShare = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !file || loading) return

    setLoading(true)
    setUploadProgress(20)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      // Telegram API Call
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      setUploadProgress(70)

      if (data.success) {
        // Supabase Entry
        const table = type === 'story' ? 'stories' : 'posts'
        const { error: dbError } = await supabase
          .from(table)
          .insert({
            user_id: user.id,
            content: type !== 'story' ? caption : null,
            telegram_file_id: data.fileId,
            media_type: data.isVideo ? 'video' : 'image',
            expires_at: type === 'story' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
          })

        if (dbError) throw dbError
        
        setUploadProgress(100)
        router.push('/')
        router.refresh()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      alert("Upload fail ho gaya: " + error.message)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Create</h1>
        <Button 
          onClick={handleShare} 
          disabled={!file || loading}
          className="rounded-full px-8"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Share
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-muted rounded-xl mb-8">
        {(["post", "reel", "story"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setFile(null); setPreview(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg capitalize transition-all ${
              type === t ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
            }`}
          >
            {t === "post" && <ImageIcon className="w-4 h-4" />}
            {t === "reel" && <Film className="w-4 h-4" />}
            {t === "story" && <History className="w-4 h-4" />}
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="relative">
          {preview ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {type === "reel" || (file?.type.startsWith('video/')) ? (
                <video src={preview} className="w-full h-full object-cover" controls />
              ) : (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              )}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-3 right-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">Telegram pe bhej raha hoon... {uploadProgress}%</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Click to upload</p>
                <p className="text-sm text-muted-foreground">
                  {type === "reel" ? "Videos: Max 1 Minute" : "Images: Unlimited Storage"}
                </p>
              </div>
            </motion.button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={type === "reel" ? "video/*" : "image/*,video/*"}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {type !== "story" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Kuch likhiye..."
              className="min-h-[120px] resize-none rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary"
              maxLength={2200}
            />
            <p className="text-xs text-muted-foreground text-right">{caption.length}/2200</p>
          </div>
        )}
      </div>
    </div>
  )
}
