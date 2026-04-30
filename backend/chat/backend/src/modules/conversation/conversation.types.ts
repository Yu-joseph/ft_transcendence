import { MessageState } from "../message/message.types.js"


export  interface StartConversationData {
    userId: string
    friendId: string
}

export interface GetMessagesProps {
    currentUserId : string
    conversationId : string
}


export  interface   ExistingConversationsT {
    /**
     * @description return-type of existing Conversation
    */
   id: string
   otherUser: {
        id: string,
        username: string,
        avatar: string | null,
        user_status: string
    }
    lastMessage: {
        id: string,
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
    conversationId: string
}

export interface MessagesPayload {
    id: string;
    content: string;
    User: {
        id: string;
        username: string;
    },
    created_at: Date;
    tempId?: string
    status?: MessageState
}
