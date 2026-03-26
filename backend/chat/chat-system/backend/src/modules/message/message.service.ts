import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { DeleteConversation } from "../conversation/conversation.types.js";

export  class MessagesServices {
    static async getMessages(data: DeleteConversation) {
        const   convExist = await prisma.conversation.findFirst({
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
}