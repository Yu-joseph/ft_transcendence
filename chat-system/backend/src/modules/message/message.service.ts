import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { DeleteConversation } from "../conversation/conversation.types.js";
import { SendMessageType } from "./message.types.js";

export  class MessagesServices {
    /** @function getMessages getting all messages from single conversation */
    static async getMessages(data: DeleteConversation) {
        const   convExist = await prisma.conversation.findUnique({
            where: {
                id: data.conversationId
            },
            include: {
                user1: {select: {id: true}},
                user2: {select: {id: true}}
            }
        });
        if (!convExist)
            throw new AppError('Conversation Not Found', 404);
        const   isParticipant = convExist.user1.id === data.currentUserId || convExist.user2.id === data.currentUserId;
        if(!isParticipant)
            throw new AppError('You are not member of this conversation', 403);

        const messages = await prisma.conversation.findUnique({
            where: {
                id: data.conversationId
            },
            include: {
                messages: {
                    select: {id: true, content: true, created_at: true, sender: {select: {id: true, username: true}}}
                }
            }
        });
        return messages;
    }
    /** @function sendMessage getting all messages from single conversation */
    static async sendMessage(senderId: number, conversationId: number, content: string) {
        const   convExist = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                user1: {select: {id: true}},
                user2: {select: {id: true}}

            }
        });
        if (!convExist)
            throw new AppError('Conversation not found', 404);
        const   isParticipant = convExist.user1.id === senderId || convExist.user2.id === senderId;
        if (!isParticipant)
            throw new AppError('You are not member of this conversation', 403);
        const   newMessage: SendMessageType = {
            senderId: senderId,
            content: content,
            conversationId: conversationId
        };
        const   saveMessage = await  prisma.message.create({
            data: newMessage,
            include: {
                sender: {select: {id: true, username: true, email: true}}
            }
        });
        // Broadcasting message the specified channel 
        // -----------------------------------------
        const   updateConv = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                updated_at: new Date()
            }
        });
        return saveMessage;
    }
}