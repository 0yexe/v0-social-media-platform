import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ChatRoom } from "@/components/chat/chat-room"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get current user profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get other user profile
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (!otherProfile) {
    notFound()
  }

  // Get messages between users
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      profiles:sender_id(*)
    `)
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherProfile.id}),and(sender_id.eq.${otherProfile.id},receiver_id.eq.${user.id})`
    )
    .is("group_id", null)
    .order("created_at", { ascending: true })

  return (
    <ChatRoom
      currentUser={{ id: user.id, profile: currentProfile }}
      otherUser={otherProfile}
      initialMessages={messages || []}
      type="dm"
    />
  )
}
