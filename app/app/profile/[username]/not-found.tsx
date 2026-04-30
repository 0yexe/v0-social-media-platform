"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { UserX, ArrowLeft, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
        >
          <UserX className="w-12 h-12 text-muted-foreground" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-3"
        >
          User Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          The profile you&apos;re looking for doesn&apos;t exist or may have been removed. 
          Please check the username and try again.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button className="rounded-xl gradient-primary text-white" asChild>
            <Link href="/app">
              <Home className="w-4 h-4 mr-2" />
              Home Feed
            </Link>
          </Button>
          <Button variant="secondary" className="rounded-xl" asChild>
            <Link href="/app/explore">
              <Search className="w-4 h-4 mr-2" />
              Explore
            </Link>
          </Button>
        </motion.div>

        {/* Suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 p-4 rounded-xl bg-card border border-border"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Tip:</span> You can search for users 
            in the Explore section or browse the home feed to discover new content.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
