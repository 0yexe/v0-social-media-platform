"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deletePost(postId: string) {
  const supabase = await createClient()

  // 1. Check karein ki user logged in hai ya nahi
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Aap login nahi hain!")

  // 2. Database se post delete karein
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id) // Safety check: Taaki sirf apni post delete ho

  if (error) {
    console.error("Delete error:", error)
    return { success: false, error: error.message }
  }

  // 3. Profile page ko refresh karein taaki post turant gayab ho jaye
  revalidatePath("/app/profile")
  return { success: true }
}
