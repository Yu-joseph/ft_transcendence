import { AcceptFriendRequest, AddFriendRequest, BlockedFriendType, CancelFriendRequest, PendingFriendType, RemoveFriendShip } from "./friend.types.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import  {RequestType} from './friend.types.js';

export class FriendService {
    /*  _________ Add Friend Request __________    */
    static async addFriend(data: AddFriendRequest) {
        const frId = await prisma.user.findUnique({
            where: { username: data.friendUsername }
        });
        if (!frId) {
            throw new AppError('The user you are trying to add does not exist.', 404);
        }

        if (data.requesterId === frId.id)
            throw new AppError('Cannot add yourself', 400);
        const existing = await prisma.friend.findFirst({
            where: {
                OR: [
                        { requesterId: data.requesterId, receiverId: frId.id },
                        { requesterId: frId.id, receiverId: data.requesterId }
                    ]
            }
        });
        if (existing) {
            if(existing.status === 'PENDING' && existing.requesterId === data.requesterId)
                throw new AppError(`Friend request to '${data.friendUsername}' already sent, wait until accept youre request.`, 400);
            if (existing.status === 'ACCEPTED')
                throw new AppError('A friend request is already accepted between these users.', 400);
            if(existing.status === 'PENDING') {
                const   result = await prisma.friend.update({
                    where: {id: existing.id},
                    data: {
                        status: 'ACCEPTED',
                        created_at: new Date()
                    }
                });
                return result;
            }
            if (existing.status === 'REJECTED') {
                const result = await prisma.friend.update({
                    where: {
                        id: existing.id,
                        status: 'REJECTED'
                    },
                    data: {
                        receiverId: frId.id,
                        requesterId: data.requesterId,
                        status: 'PENDING',
                        created_at: new Date()
                    }
                });
                return result;
            }
        }
        const newRequest = await prisma.friend.create({
            data: {
                requesterId: data.requesterId as string,
                receiverId: frId.id,
                status: 'PENDING',
                created_at: new Date()
            }
        });
        return newRequest;
    }
    /*  _________ Accept Friend Request __________    */
    static async acceptFriend(data: AcceptFriendRequest) {
        const friendRequest = await prisma.friend.findUnique({
            where: {
                id: data.friendRequestId
            }
        });
        if (!friendRequest)
            throw new AppError('Friend Request Not Found', 404);

        if (friendRequest.receiverId !== data.receiverId) { /* user.id(receiver) should accept not the other user */
            throw new AppError('You do not have permission to perform this action on this request.', 403)
        }
        switch (friendRequest.status) {
            case 'REJECTED':
                throw new AppError('This friend request was rejected \
                and cannot be accepted. Please ask the sender to send a new request.'
                    , 409)
            case 'ACCEPTED':
                return friendRequest;

            case 'PENDING':
                const result = await prisma.friend.update({
                    where: {
                        id: data.friendRequestId,
                        receiverId: data.receiverId
                    },
                    data: {
                        status: 'ACCEPTED'
                    }
                });
                return result;
        }
    }
    /*  _________ Reject Friend Request __________    */
    static async rejectFriend(data: AcceptFriendRequest) {

        const friendRequest = await prisma.friend.findUnique({
            where: { id: data.friendRequestId }
        });
        if (!friendRequest)
            throw new AppError('Friend request not found', 404);
        if (friendRequest.receiverId !== data.receiverId)
            throw new AppError('Not authorized', 403);

        switch (friendRequest.status) {
            case 'ACCEPTED':
                throw new AppError('Request already accepted and cannot be rejected', 400);
            case 'REJECTED':
                return friendRequest;
            case 'PENDING':
                const result = await prisma.friend.update({
                    where: {
                        id: data.friendRequestId,
                        receiverId: data.receiverId
                    },
                    data: {
                        status: 'REJECTED'
                    }
                });
                return result;
        }
    }
    /*  _________ Remove Friends Relation __________    */
    static async removeFriendShip(data: RemoveFriendShip) {
        if (data.requesterId === data.friendId)
            throw new AppError('Friend Ship not found', 409);
        const exist = await prisma.friend.findFirst({
            where: {
                OR: [
                    {receiverId: data.friendId, requesterId: data.requesterId},
                    {receiverId: data.requesterId, requesterId: data.friendId}
                ]
            }
        });
        if (!exist)
            throw new AppError('FriendShip not found', 404);
        switch (exist.status) {
            case 'PENDING':
                throw new AppError('You cannot remove a pending request. Please use the \'Cancel\' option instead.', 400);
            case 'REJECTED':
                throw new AppError('This friendship was previously rejected and cannot be removed.', 409);
            case 'ACCEPTED':
                const result = await prisma.friend.delete({
                    where: {
                        id: exist.id
                    }
                });
                return result;
        }
    }
    /*  _________ Cancel Friends Request __________    */
    static async cancelFriend(data: CancelFriendRequest) {
        const existed = await prisma.friend.findUnique({
            where: {
                id: data.friendRequestId
            }
        });
        if (!existed)
            throw new AppError('Request Not Found', 404);
        if (existed.requesterId !== data.userId)
            throw new AppError('Not authorized', 403);
        switch (existed.status) {
            case 'ACCEPTED':
                throw new AppError('Cannot cancel a request that has already been accepted. Try removing the friendship instead.', 400)
            case 'REJECTED': {
                if(existed.requesterId !== data.userId)
                    throw new AppError('Cannot cancel a request that has already been rejected. Try removing the friendship instead.', 400);
                const result = await prisma.friend.delete({
                    where: {
                        id: data.friendRequestId,
                        requesterId: data.userId,
                        status: 'REJECTED'
                    }
                });
                return result;
            }
            case 'PENDING':
                const result = await prisma.friend.delete({
                    where: {
                        id: data.friendRequestId,
                        requesterId: data.userId,
                        status: 'PENDING'
                    }
                });
                return result;
        }
}
    /*  _________ Get All FriendShip __________    */
    static async getFriends(userId: string) {
        console.log('User in friend service:', userId);
        const Info = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        const friendship = await prisma.friend.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ],
                status: 'ACCEPTED'
            },
            include: {
                User_Friend_receiverIdToUser: { select: { id: true, username: true, avatar: true, created_at: true } },
                User_Friend_requesterIdToUser: { select: { id: true, username: true, avatar: true, created_at: true } }
            }
        });
        /** filter to return just the friend excluding currentUser */
        return friendship.map(f => f.requesterId === userId ? f.User_Friend_receiverIdToUser : f.User_Friend_requesterIdToUser);
    }
    /*  _________ Get Rejected FriendShip __________    */
    static async getRejectedFriend(userId: string) : Promise<BlockedFriendType[]> {
        const rejected = await prisma.friend.findMany({
            where: {
                receiverId: userId,
                status: 'REJECTED'
            },
            include: {
                User_Friend_receiverIdToUser: { select: { id: true, username: true, avatar: true} },
                User_Friend_requesterIdToUser: { select: { id: true, username: true, avatar: true} }
            }
        });
        return rejected.map(f => f.requesterId === userId ? f.User_Friend_receiverIdToUser : f.User_Friend_requesterIdToUser);
    }
    /*  _________ Get PENDING FriendShip __________    */
    static async getPendingFriend(userId: string) : Promise<PendingFriendType[]> {

        const pendingRequest = await prisma.friend.findMany({
            where: {
                OR: [
                    { receiverId: userId }, { requesterId: userId }
                ],
                AND: {
                    OR: [{status: 'PENDING'}, {status: 'REJECTED'}]
                }
            },
            include: {
                User_Friend_receiverIdToUser: { select: { id: true, username: true, avatar: true } },
                User_Friend_requesterIdToUser: { select: { id: true, username: true, avatar: true } },
            }
        });
        const data : PendingFriendType[] = pendingRequest.map(penReq => {
            const   type : RequestType =  penReq.requesterId === userId ? 'outgoing' : 'incoming';
            const   friendRequest : PendingFriendType = {
                friendRequestId: penReq.id,
                status: penReq.status,
                userInfo: type === 'outgoing' ? penReq.User_Friend_receiverIdToUser : penReq.User_Friend_requesterIdToUser,
                type: type
            }
            return friendRequest
        });
        return data;
    }
    // static async IsFriends(currentUserId: string, otherUserId: string) : Promise<boolean> {

    static async getFriendById(userId: string, friendId: string) {
        const existed = await prisma.user.findUnique({
            where: {
                id: friendId
            },
            select: {id: true, username: true, status: true, avatar: true}
        });
        if (!existed)
            throw new AppError('User Not Found', 404);
        return existed;
    }
}