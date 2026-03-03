export  interface StartConversationData {
    userId: number | undefined
    otherUserId: number
}

export  interface   ExistingConversationsT {
    /**
     * @description return-type of existing Conversation
    */
   id: number
   otherUser: {
       id: number,
        username: string,
        email: string
    }
    lastMessage: {
        id: number,
        created_at: Date,
        content: string,
        senderId: number
    } | null
    updated_at: Date
}

export interface SingleConversation extends ExistingConversationsT {
    statusOfRes: {
        statusCode: number,
        message: string
    }
}

export  interface DeleteConversation {
    currentUserId: number
    conversationId: number
}