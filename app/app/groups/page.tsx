import { createClient } from "@/lib/supabase/server"
import { GroupsList } from "@/components/groups/groups-list"

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's groups
  const { data: myGroups } = await supabase
    .from("group_members")
    .select(`
      *,
      groups (
        *,
        profiles:admin_id(*),
        group_members(count)
      )
    `)
    .eq("user_id", user.id)

  // Get all public groups for discovery
  const { data: allGroups } = await supabase
    .from("groups")
    .select(`
      *,
      profiles:admin_id(*),
      group_members(count)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <GroupsList
        myGroups={myGroups?.map((g) => g.groups) || []}
        discoverGroups={allGroups || []}
        currentUserId={user.id}
      />
    </div>
  )
}
