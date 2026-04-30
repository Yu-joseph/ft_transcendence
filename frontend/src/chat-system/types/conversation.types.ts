export interface ConversationType {
    id: string
    otherUser: {
        id: string
        username: string
        avatar: string
        user_status: string
    }
    lastMessage: {
        id: string
        created_at: Date
        content: string
        senderId: string
    } | null
    updated_at: Date
}