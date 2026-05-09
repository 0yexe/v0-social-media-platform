export async function deletePost(postId: string) {
  const supabase = await createClient()
  
  // Pehle check karte hain user logged in hai ya nahi
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Database se post delete karna
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id) // Safety check: Taaki sirf apni post delete ho

  if (error) throw error
}
