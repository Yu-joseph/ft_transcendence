

export  interface StartConversationData {
    userId: string
    friendId: string
}

export interface GetMessagesProps {
    currentUserId : string
    conversationId : number
}


export  interface   ExistingConversationsT {
    /**
     * @description return-type of existing Conversation
    */
   id: bigint
   otherUser: {
        id: string,
        username: string,
        avatar: string | null,
        status: string
    }
    lastMessage: {
        id: bigint,
        created_at: Date,
        content: string,
        senderId: string
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
    currentUserId: string
    conversationId: number
}

export interface MessagesPayload {
    id: bigint;
    content: string;
    User: {
        id: string;
        username: string;
    },
    created_at: Date;
}