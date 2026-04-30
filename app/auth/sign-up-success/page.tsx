"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
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
          className="w-20 h-20 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center"
        >
          <Mail className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground mb-4">Check your email</h1>
        <p className="text-muted-foreground mb-8 text-pretty">
          {"We've sent you a confirmation link. Please check your inbox and click the link to activate your account."}
        </p>

        <Button asChild className="gradient-primary text-white rounded-xl h-12 px-8">
          <Link href="/auth/login">
            Go to Login
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
