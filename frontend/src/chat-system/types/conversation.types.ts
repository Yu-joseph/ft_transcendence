export interface ConversationType {
    id: number
    otherUser: {
        id: string
        username: string
        email: string
    }
    lastMessage: {
        id: number
        created_at: Date
        content: string
        senderId: string
    } | null
    updated_at: Date
}