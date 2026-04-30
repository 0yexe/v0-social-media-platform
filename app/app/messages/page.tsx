import { createClient } from "@/lib/supabase/server"
import { ChatList } from "@/components/chat/chat-list"

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's conversations (DMs)
  const { data: conversations } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*),
      receiver:profiles!messages_receiver_id_fkey(*)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .is("group_id", null)
    .order("created_at", { ascending: false })

  // Get user's groups
  const { data: groups } = await supabase
    .from("group_members")
    .select(`
      *,
      groups (
        *,
        profiles (*)
      )
    `)
    .eq("user_id", user.id)

  // Group conversations by other user
  const uniqueConversations = new Map()
  conversations?.forEach((msg) => {
    const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
    if (!uniqueConversations.has(otherUserId)) {
      uniqueConversations.set(otherUserId, {
        id: otherUserId,
        profile: otherUser,
        lastMessage: msg,
        type: "dm",
      })
    }
  })

  const chatItems = [
    ...Array.from(uniqueConversations.values()),
    ...(groups?.map((g) => ({
      id: g.groups.id,
      group: g.groups,
      lastMessage: null,
      type: "group",
    })) || []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <ChatList items={chatItems} currentUserId={user.id} />
    </div>
  )
}
