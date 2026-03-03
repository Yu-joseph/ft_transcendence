import { FriendsStatus } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import  { DeleteConversation, ExistingConversationsT, SingleConversation, StartConversationData }   from './conversation.types.js';

export  class   ConversationService {
    /**
     * @param userId authenticated user from jwt-payload
     */
    /**
     * @function listConversations get all conversations of userId
     */
    static async listConversations(userId: number) {
        const   exist = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        console.log(exist);
        if(!exist)
            throw new AppError('Unathorized', 401);
        const   conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    {user1Id: userId},
                    {user2Id: userId}
                ]
            },
            include: {
                user1: {select: {id: true, username: true, email: true}},
                user2: {select: {id: true, username: true, email: true}},
                messages: {
                    take: 1,
                    orderBy: {created_at: 'desc'},
                    select: {id: true, content: true, senderId: true, created_at: true}
                }
            },
            orderBy: {updated_at: 'desc'}
        });

        const result: ExistingConversationsT[] = conversations.map(conv => ({
            id: conv.id,
            otherUser: conv.user1Id === userId ? conv.user2 : conv.user1,
            lastMessage: conv.messages[0] || null,
            updated_at: conv.updated_at
        }));
        return result;
    }
    /**
     * @function startConversation userId create new conversation with otherUserId
     */
    static async startConversation(data: StartConversationData) {
        const   friendShipExist = await prisma.friend.findFirst({
            where: {
                OR: [
                    {receiverId: data.userId, requesterId: data.otherUserId},
                    {receiverId: data.otherUserId, requesterId: data.userId}
                ],
                status: FriendsStatus.ACCEPTED
            }
        });
        if(!friendShipExist)
            throw new AppError("This user is not in your friends list.", 401);
        const   user1Id = Math.min(data.userId as number, data.otherUserId);
        const   user2Id = Math.max(data.userId as number, data.otherUserId);

        const   conversationExist = await prisma.conversation.findUnique({
            where: {
                user1Id_user2Id: {
                    user1Id: user1Id,
                    user2Id: user2Id
                }
                // my conversation schema alwayse user1Id < user2Id
            },
            include: {
                user1: {select: {id: true, username: true, email: true}},
                user2: {select: {id: true, username: true, email: true}},
                messages: {
                    take: 1,
                    orderBy: {created_at: 'desc'},
                    select: {id: true, content: true, senderId: true, created_at: true}
                }
            },
        });
        if (conversationExist) {
            const   otherUser = conversationExist.user1Id === data.userId ? conversationExist.user2 : conversationExist.user1;
            const res : SingleConversation = {
                statusOfRes: {
                    statusCode: 200,
                    message: 'Conversation Already exist'
                },
                id: conversationExist.id,
                otherUser: otherUser,
                lastMessage: conversationExist.messages[0] || null,
                updated_at: conversationExist.updated_at
            }
            return res;
        }
        const   createdConv = await prisma.conversation.create({
            data: {
                user1Id: user1Id,
                user2Id: user2Id,
            },
            include: {
                user1: {select: {id: true, username: true, email: true}},
                user2: {select: {id: true, username: true, email: true}},
            }
        });
        const   otherUser = createdConv.user1Id === data.userId ? createdConv.user2 : createdConv.user1;
        const   res : SingleConversation = {
            statusOfRes: {
                statusCode: 201,
                message: 'Conversation Created successfuly'
            },
            id: createdConv.id,
            otherUser: otherUser,
            lastMessage: null,
            updated_at: createdConv.updated_at
        }
        return res;
    }
      /**
     * @function deleteConversation userId create new conversation with otherUserId
     */
    // static async deleteConversation(data: DeleteConversation) {

    // }
}