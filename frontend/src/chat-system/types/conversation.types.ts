export interface ConversationType {
    id: number
    otherUser: {
        id: string
        username: string
        avatar: string
        user_status: string
    }
    lastMessage: {
        id: number
        created_at: Date
        content: string
        senderId: string
    } | null
    updated_at: Date
}