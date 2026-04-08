import { MessagesPayload } from "../conversation/conversation.types.js";
export  interface MessagesType {
    id: number,
    messages: object | undefined
}

export interface SendMessageType {
    senderId: string
    content: string
    conversationId: number
    created_at: Date
}


export interface MessageItem {
  id: number;
  content: string;
  sender: {
    id: string;
    username: string;
  };
  created_at: string; // server usually returns ISO string
}

export interface MessagesWithConvId {
  convId: bigint;
  messages: MessagesPayload[];
}