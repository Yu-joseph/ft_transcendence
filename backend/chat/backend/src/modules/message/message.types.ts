import { MessagesPayload } from "../conversation/conversation.types.js";
export  interface MessagesType {
    id: string,
    messages: object | undefined
}

export interface SendMessageType {
    senderId: string
    content: string
    conversationId: bigint
    created_at: Date
}


export interface MessageItem {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  created_at: string; // server usually returns ISO string
}

export interface MessagesWithConvId {
  convId: string;
  messages: MessagesPayload[];
}

export type MessageState = 'pending' | 'sent' | 'error';

export interface MessageToSendType {
    content: string
    tempId: string
    status: MessageState
}