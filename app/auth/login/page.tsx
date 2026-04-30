"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, MessageCircle, Heart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/app")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary animate-gradient">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Floating Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-8"
          >
            <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center">
              <MessageCircle className="w-12 h-12" />
            </div>
          </motion.div>

          <h1 className="text-5xl font-bold mb-4 text-center text-balance">
            Connect. Share. Inspire.
          </h1>
          <p className="text-xl text-white/80 text-center max-w-md text-pretty">
            Join millions sharing moments and conversations that matter.
          </p>

          {/* Feature Icons */}
          <div className="flex gap-8 mt-12">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center">
                <Heart className="w-7 h-7" />
              </div>
              <span className="text-sm text-white/70">Stories</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="text-sm text-white/70">Messages</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-sm text-white/70">Groups</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl gradient-primary text-white font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
