
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
    static async listConversations(userId: string) : Promise<ExistingConversationsT[]> {
        const   exist = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        console.log(exist);
        if(!exist)
            throw new AppError('Unauthorized', 401);
        const   conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    {user1Id: userId},
                    {user2Id: userId}
                ]
            },
            include: {
                User_Conversation_user1IdToUser: {select: {id: true, username: true, avatar: true, status: true}},
                User_Conversation_user2IdToUser: {select: {id: true, username: true, avatar: true, status: true}},
                Message: {
                    take: 1,
                    orderBy: {created_at: 'desc'},
                    select: {id: true, content: true, senderId: true, created_at: true}
                }
            },
            orderBy: {updated_at: 'desc'}
        });

        const result : ExistingConversationsT[] = conversations.map(conv => ({
            id: conv.id,
            otherUser: conv.user1Id === userId ? conv.User_Conversation_user2IdToUser : conv.User_Conversation_user1IdToUser,
            lastMessage: conv.Message?.[0] ?? null,
            updated_at: conv.updated_at
        }));
        console.log('Conversation list:', result);
        return result;
    }
    /**
     * @function startConversation userId create new conversation with otherUserId
     */
    static async startConversation(data: StartConversationData) {
        const   friendShipExist = await prisma.friend.findFirst({
            where: {
                OR: [
                    {receiverId: data.userId, requesterId: data.friendId},
                    {receiverId: data.friendId, requesterId: data.userId}
                ],
                status: 'ACCEPTED'
            }
        });
        if(!friendShipExist)
            throw new AppError("This user is not in your friends list.", 401);
        // const   user1Id = Math.min(data.userId as string, data.friendId);
        // const   user2Id = Math.max(data.userId as string, data.friendId);

        const   [user1Id, user2Id] = data.userId <= data.friendId ? [data.userId, data.friendId] :
                                     [data.friendId, data.userId];

        const   conversationExist = await prisma.conversation.findUnique({
            where: {
                user1Id_user2Id: {
                    user1Id: user1Id,
                    user2Id: user2Id
                }
                // my conversation schema alwayse user1Id < user2Id
            },
            include: {
                User_Conversation_user1IdToUser: {select: {id: true, username: true, avatar: true, status: true}},
                User_Conversation_user2IdToUser: {select: {id: true, username: true, avatar: true, status: true}},
                Message: {
                    take: 1,
                    orderBy: {created_at: 'desc'},
                    select: {id: true, content: true, senderId: true, created_at: true}
                }
            },
        });
        if (conversationExist) {
            const   otherUser = conversationExist.user1Id === data.userId ? conversationExist.User_Conversation_user2IdToUser : conversationExist.User_Conversation_user1IdToUser;
            const   res : SingleConversation = {
                statusOfRes: {
                    statusCode: 200,
                    message: 'Conversation Already exist'
                },
                id: conversationExist.id,
                otherUser: otherUser,
                lastMessage: conversationExist.Message?.[0] ?? null,
                updated_at: conversationExist.updated_at
            }
            return res;
        }
        const   createdConv = await prisma.conversation.create({
            data: {
                user1Id: user1Id,
                user2Id: user2Id,
                created_at: new Date,
                updated_at: new Date
            },
            include: {
                User_Conversation_user1IdToUser: {select: {id: true, username: true, avatar: true, status: true}},
                User_Conversation_user2IdToUser: {select: {id: true, username: true, avatar: true, status: true}},
            }
        });
        const   otherUser = createdConv.user1Id === data.userId ? createdConv.User_Conversation_user2IdToUser : createdConv.User_Conversation_user1IdToUser;
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
    static async deleteConversation(data: DeleteConversation) {
        const   convExist = await prisma.conversation.findUnique({
            where: {
                id: data.conversationId
            },
            select: {id: true}
        });
        if (!convExist)
            throw new AppError('Conversation Not Found', 404);
        const   inConv = await prisma.conversation.findFirst({
            where: {
                id: convExist.id,
                OR: [ {user1Id:  data.currentUserId}, {user2Id: data.currentUserId} ]
            }
        });
        if(!inConv)
            throw new AppError('You are not member on this conversation',401);
        const   deletedConv = await prisma.$transaction([
            prisma.message.deleteMany({where: {conversationId: data.conversationId}}),
            prisma.conversation.delete({where: {id: data.conversationId}, select: {id: true}})
        ]);

        return deletedConv[1].id;
    }
}