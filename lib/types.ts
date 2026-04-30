export interface Profile {
  id: string
  username: string
  email: string | null
  bio: string | null
  profile_pic_url: string | null
  is_private: boolean
  hide_following: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  media_url: string | null
  caption: string | null
  type: "post" | "reel"
  created_at: string
  profiles?: Profile
  likes?: Like[]
  comments?: Comment[]
  _count?: {
    likes: number
    comments: number
  }
}

export interface Story {
  id: string
  user_id: string
  media_url: string
  expires_at: string
  created_at: string
  profiles?: Profile
}

export interface Group {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  admin_id: string
  is_restricted: boolean
  created_at: string
  profiles?: Profile
  group_members?: GroupMember[]
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: "admin" | "moderator" | "member"
  joined_at: string
  profiles?: Profile
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string | null
  group_id: string | null
  content: string
  is_unsent: boolean
  is_read: boolean
  created_at: string
  profiles?: Profile
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
  profiles?: Profile
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}
