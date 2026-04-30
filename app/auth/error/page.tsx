"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-destructive/10 mx-auto mb-6 flex items-center justify-center"
        >
          <AlertCircle className="w-10 h-10 text-destructive" />
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground mb-4">Authentication Error</h1>
        <p className="text-muted-foreground mb-8 text-pretty">
          Something went wrong during authentication. Please try again or contact support if the problem persists.
        </p>

        <Button asChild variant="outline" className="rounded-xl h-12 px-8">
          <Link href="/auth/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
