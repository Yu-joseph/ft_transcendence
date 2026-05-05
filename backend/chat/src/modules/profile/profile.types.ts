export interface UserProfileInfo {
    id: string
    username: string
    email: string
    fullname: string
    created_at: Date
    avatar: string | null
    status: string
    bio?: string
    rank?: number
    isFriend?: FriendStat
}

export type FriendStat = 'accepted' | 'pending' | 'not';
 