export interface ConversationType {
    id: number
    otherUser: {
        id: number
        username: string
        email: string
    }
    lastMessage: {
        id: number
        created_at: Date
        content: string
        senderId: number
    } | null
    updated_at: Date
}