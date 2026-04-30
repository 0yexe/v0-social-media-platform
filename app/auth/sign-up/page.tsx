"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, MessageCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const passwordStrength = () => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          username,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/auth/sign-up-success")
    }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
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
            <h2 className="text-3xl font-bold text-foreground">Create account</h2>
            <p className="text-muted-foreground mt-2">Join our community today</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
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
              <label className="text-sm font-medium text-foreground">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))}
                  className="pl-12 h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 pt-2"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength >= level
                            ? level <= 1
                              ? "bg-destructive"
                              : level <= 2
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className={`flex items-center gap-1 ${password.length >= 8 ? "text-green-500" : ""}`}>
                      <Check className="w-3 h-3" /> 8+ chars
                    </span>
                    <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-500" : ""}`}>
                      <Check className="w-3 h-3" /> Uppercase
                    </span>
                    <span className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-500" : ""}`}>
                      <Check className="w-3 h-3" /> Number
                    </span>
                    <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}`}>
                      <Check className="w-3 h-3" /> Special
                    </span>
                  </div>
                </motion.div>
              )}
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
                "Create Account"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              {" and "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary animate-gradient">
        <div className="absolute inset-0 bg-black/20" />
        
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
            Start Your Journey
          </h1>
          <p className="text-xl text-white/80 text-center max-w-md text-pretty">
            Create, share, and connect with people around the world.
          </p>

          {/* Features List */}
          <div className="mt-12 space-y-4">
            {[
              "Share photos, videos & stories",
              "Real-time messaging & groups",
              "Privacy controls you can trust",
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 glass px-6 py-3 rounded-xl"
              >
                <Check className="w-5 h-5 text-green-300" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>
    </div>
  )
}
