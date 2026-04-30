"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Image, Film, X, Upload, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

type PostType = "post" | "reel" | "story"

export default function CreatePostPage() {
  const [type, setType] = useState<PostType>("post")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File too large. Maximum size is 50MB.")
        return
      }
      
      setError(null)
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setUploadProgress(0)
    
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload file to Vercel Blob
      setUploadProgress(20)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", type === "story" ? "stories" : "posts")

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { pathname } = await uploadResponse.json()
      setUploadProgress(70)

      // Save to database with pathname (for private blob access)
      if (type === "story") {
        const { error: dbError } = await supabase.from("stories").insert({
          user_id: user.id,
          media_url: pathname,
        })
        if (dbError) throw dbError
      } else {
        const { error: dbError } = await supabase.from("posts").insert({
          user_id: user.id,
          media_url: pathname,
          caption,
          type,
        })
        if (dbError) throw dbError
      }

      setUploadProgress(100)
      router.push("/app")
      router.refresh()
    } catch (err) {
      console.error("Error creating post:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Create</h1>
          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="gradient-primary text-white rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadProgress}%
              </>
            ) : (
              "Share"
            )}
          </Button>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Type Selector */}
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          {[
            { value: "post", label: "Post", icon: Image },
            { value: "reel", label: "Reel", icon: Film },
            { value: "story", label: "Story", icon: Upload },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setType(value as PostType)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                type === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* File Upload */}
        <div className="relative">
          {preview ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
              {file?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                }}
                className="absolute top-3 right-3 rounded-full bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
              
              {/* Upload Progress Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Uploading... {uploadProgress}%</p>
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
                <p className="font-medium text-foreground">
                  Click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  {type === "reel" ? "MP4, WebM up to 50MB" : "JPG, PNG, GIF, WebP up to 50MB"}
                </p>
              </div>
            </motion.button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={type === "reel" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/gif,image/webp"}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Caption (not for stories) */}
        {type !== "story" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Caption
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="min-h-[120px] resize-none rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary"
              maxLength={2200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {caption.length}/2200
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
