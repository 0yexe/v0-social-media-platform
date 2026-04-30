"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Search, Users, Lock, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { Group, Profile } from "@/lib/types"

interface GroupsListProps {
  myGroups: (Group & { profiles: Profile; group_members: { count: number }[] })[]
  discoverGroups: (Group & { profiles: Profile; group_members: { count: number }[] })[]
  currentUserId: string
}

export function GroupsList({ myGroups, discoverGroups, currentUserId }: GroupsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [isRestricted, setIsRestricted] = useState(false)
  const [creating, setCreating] = useState(false)

  const filteredMyGroups = myGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDiscover = discoverGroups.filter(
    (g) =>
      !myGroups.some((mg) => mg.id === g.id) &&
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return

    setCreating(true)
    const supabase = createClient()

    try {
      const { data: group, error } = await supabase
        .from("groups")
        .insert({
          name: newGroupName,
          description: newGroupDescription,
          admin_id: currentUserId,
          is_restricted: isRestricted,
        })
        .select()
        .single()

      if (error) throw error

      // Add creator as admin member
      await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: currentUserId,
        role: "admin",
      })

      setShowCreateModal(false)
      setNewGroupName("")
      setNewGroupDescription("")
      setIsRestricted(false)
      window.location.reload()
    } catch (error) {
      console.error("Error creating group:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    const supabase = createClient()
    await supabase.from("group_members").insert({
      group_id: groupId,
      user_id: currentUserId,
      role: "member",
    })
    window.location.reload()
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 p-4 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Groups</h1>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What's this group about?"
                    className="mt-1.5 rounded-xl"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Admin-only messaging</p>
                      <p className="text-xs text-muted-foreground">
                        Only admins can send messages
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsRestricted(!isRestricted)}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      isRestricted ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      animate={{ x: isRestricted ? 22 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || creating}
                  className="w-full gradient-primary text-white rounded-xl"
                >
                  {creating ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/50 border-0"
          />
        </div>
      </header>

      <div className="p-4 space-y-8">
        {/* My Groups */}
        {filteredMyGroups.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">My Groups</h2>
            <div className="space-y-3">
              {filteredMyGroups.map((group) => (
                <Link key={group.id} href={`/app/messages/group/${group.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border"
                  >
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={group.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Users className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{group.name}</p>
                        {group.is_restricted && (
                          <Shield className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.description || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {group.group_members?.[0]?.count || 0} members
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Discover Groups */}
        {filteredDiscover.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Discover</h2>
            <div className="space-y-3">
              {filteredDiscover.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={group.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Users className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{group.name}</p>
                      {group.is_restricted && (
                        <Shield className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {group.description || "No description"}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    variant="outline"
                    className="rounded-xl shrink-0"
                  >
                    Join
                  </Button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredMyGroups.length === 0 && filteredDiscover.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No groups found</h3>
            <p className="text-muted-foreground">
              Create a new group or search for existing ones
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
