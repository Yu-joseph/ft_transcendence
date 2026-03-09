export  interface MessagesType {
    id: number,
    messages: object | undefined
}

export interface SendMessageType {
    senderId: number
    content: string
    conversationId: number
}