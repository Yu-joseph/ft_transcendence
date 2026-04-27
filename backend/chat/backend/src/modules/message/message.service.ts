
import { prisma } from "../../lib/prisma.js";
import { getIo } from "../../socket/index.js";
import { AppError } from "../../utils/AppError.js";
import { GetMessagesProps, MessagesPayload } from "../conversation/conversation.types.js";
import { SendMessageType, MessagesWithConvId } from "./message.types.js";

export  class MessagesServices {
    /** @function getMessages getting all messages from single conversation by conversation ID*/
    static async getMessagesByConvId(data: GetMessagesProps) {

        const   conversationExist = await prisma.conversation.findUnique({
            where: {
                id: data.conversationId
            },
            include: {
                User_Conversation_user1IdToUser: {select: {id: true}},
                User_Conversation_user2IdToUser: {select: {id: true}}
            }
        });
        if (!conversationExist) {
            throw new AppError('Conversation Not found', 404);
        }
        const   isFriend = await prisma.friend.findFirst({
            where: {
                OR: [
                        { requesterId: conversationExist.user1Id, receiverId: conversationExist.user2Id },
                        { requesterId: conversationExist.user2Id, receiverId: conversationExist.user1Id }
                    ],
                status: 'ACCEPTED'
            }
        });
        if (!isFriend)
            throw new AppError('Access denied: You are no longer friends.', 403);
        const   isParticipant = conversationExist.User_Conversation_user1IdToUser.id === data.currentUserId || conversationExist.User_Conversation_user2IdToUser.id === data.currentUserId;
        if(!isParticipant)
            throw new AppError('You are not member of this conversation', 403);

        const messages = await prisma.conversation.findUnique({
            where: {
                id: conversationExist.id
            },
            select: {
                Message: {
                    orderBy: {created_at: 'asc'},
                    select: {id: true, content: true, created_at: true, User: {select: {id: true, username: true}}}
                },
            },
        });
        if (!messages) {
            throw new AppError('Messages of this conversation not found', 404);
        }
        return messages?.Message ?? [] as MessagesPayload[];
    }
    /** @function getMessages getting all messages from single conversation by friend ID*/
    static async getMessagesByFriendId(data: {currentUserId: string, friendId: string}): Promise<MessagesWithConvId> {
        const   friend = await prisma.user.findUnique({where: {id: data.friendId}, select: {id: true}});
        if(!friend)
            throw new AppError('User not found', 404);
        const   isFriends = await prisma.friend.findFirst({
            where: {
                OR: [
                    {requesterId: data.currentUserId, receiverId: data.friendId},
                    {requesterId: data.friendId, receiverId: data.currentUserId}
                ],
                AND: {status: 'ACCEPTED'}
            },
            select: {id: true}
        });
        if(!isFriends)
            throw new AppError('You are not friends to start this conversation', 403);
        const   [user1Id, user2Id] = data.currentUserId <= data.friendId ? [data.currentUserId, data.friendId] : [data.friendId, data.currentUserId];
        const   conversationExist = await prisma.conversation.findUnique({
            where: {
                user1Id_user2Id: {
                    user1Id,
                    user2Id
                }
            },
            include: {
                User_Conversation_user1IdToUser: {select: {id: true}},
                User_Conversation_user2IdToUser: {select: {id: true}}
            }
        });
        if (!conversationExist) {
            throw new AppError('Conversation Not found', 404);
        }
        const messages = await prisma.conversation.findUnique({
            where: {
                id: conversationExist.id
            },
            select: {
                Message: {
                    orderBy: {created_at: 'asc'},
                    select: {id: true, content: true, created_at: true, User: {select: {id: true, username: true}}}
                },
            },
        });
        return {convId: conversationExist.id, messages: messages?.Message ?? [] as MessagesPayload[]};
    }
    /** @function sendMessage getting all messages from single conversation */
    static async sendMessage(senderId: string, conversationId: bigint, content: string, tempId: string) {
        const   convExist = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                User_Conversation_user1IdToUser: {select: {id: true, username: true}},
                User_Conversation_user2IdToUser: {select: {id: true, username: true}}
            }
        });
        if (!convExist)
            throw new AppError('Conversation not found', 404);
        const   isParticipant = convExist.User_Conversation_user1IdToUser.id === senderId || convExist.User_Conversation_user2IdToUser.id === senderId;
        if (!isParticipant)
            throw new AppError('You are not member of this conversation', 403);
        const   newMessage: SendMessageType = {
            senderId: senderId,
            content: content,
            conversationId: conversationId,
            created_at: new Date
        };
        const   isFriend = await prisma.friend.findFirst({
            where: {
                OR: [
                    {receiverId: convExist.user1Id, requesterId: convExist.user2Id},
                    {receiverId: convExist.user2Id, requesterId: convExist.user1Id}
                ]
            }
        });
        if(isFriend === null) {
            throw new AppError('You are not friends anymore! Message cannot be sent.', 403);
        }
        const   [saveMessage, updateConv] = await prisma.$transaction([
            prisma.message.create({ data: newMessage, include: { User: {select: {id: true, username: true}} }}),
            prisma.conversation.update({
            where: { id: conversationId }, data: { updated_at: new Date() }})
        ]);

        const   io = getIo();
        console.log(`Sending message to room ${conversationId}`);
        /** **** emit message to member on channel */
        io.to(`ROOM_${conversationId.toString()}`)
            .emit('message:new', {...saveMessage, tempId: tempId});
        /**Update conversation list for both sender and receiver */
        io.to(convExist.user1Id).to(convExist.user2Id)
            .emit('conversation:updated',
            {
                lastMessage: {
                    id: saveMessage.id, created_at: saveMessage.created_at, content: saveMessage.content, senderId: saveMessage.User.id
                } 
                , updated_at: updateConv.updated_at, convId: updateConv.id});
        /** get the recever and emit a notification for it */
        const   recever = convExist.user1Id === senderId ? convExist.User_Conversation_user2IdToUser: convExist.User_Conversation_user1IdToUser;
        io.to(recever.id)
            .emit('notification:new_message', {senderName: saveMessage.User.username, content: newMessage.content});
        return saveMessage;
    }
}