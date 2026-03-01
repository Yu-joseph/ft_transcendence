import { AcceptFriendRequest, AddFriendRequest, AddFriendResponse, CancelFriendRequest, RemoveFriendShip } from "./friend.types.js";
import { prisma } from "../../lib/prisma.js";
import { FriendsStatus } from "../../../generated/prisma/index.js";
import { AppError } from "../../utils/AppError.js";
import { threadCpuUsage } from "node:process";

export  class FriendService {
    /*  _________ Add Friend Request __________    */
    static async addFriend(data: AddFriendRequest) {
        if (data.requesterId == data.receiverId)
            throw new AppError('Cannot add yourself', 400);

        const   frId = await prisma.user.findUnique({
            where: {
                id: data.receiverId
            }
        });
        if(!frId) {
            throw new AppError('User Not Found', 404);
        }
        const   existing = await prisma.friend.findFirst({
            where: {
                OR: [
                    {requesterId: data.requesterId, receiverId: data.receiverId},
                    {requesterId: data.receiverId, receiverId: data.requesterId}
                ]
            }
        })
        console.log("++++:",existing);
        if(existing)
            throw new AppError('Friend request already exist', 400);
        console.log(`RequesterId: ${data.requesterId},, ReceiverId: ${data.receiverId}`);
        const   newRequest = await prisma.friend.create({
            data: {
                requesterId: data.requesterId as number,
                receiverId: data.receiverId,
                status: FriendsStatus.PENDING
            }
        });
        return newRequest;
    }
    /*  _________ Accept Friend Request __________    */
    static async AcceptFriend(data: AcceptFriendRequest) {
        const   friendRequest = await prisma.friend.findUnique({
            where: {
                id: data.friendRequestId
                // receiverId: data.receiverId
            }
        });
        if(!friendRequest)
            throw new AppError('Friend Request Not Found', 404);

        if (friendRequest.receiverId !== data.receiverId) { /* user.id(receiver) should accept not the other user */
            throw new AppError('Not authorized', 403)
        }
        switch (friendRequest.status) {
            case FriendsStatus.REJECTED:
                throw new AppError('This friend request was rejected \
                and cannot be accepted. Please ask the sender to send a new request.'
                , 409)
            case FriendsStatus.ACCEPTED:
                return friendRequest;
        
            case FriendsStatus.PENDING:
                const   result = await prisma.friend.update({
                    where: {
                        id: data.friendRequestId,
                        receiverId: data.receiverId
                    },
                    data: {
                        status: FriendsStatus.ACCEPTED
                    }
                });
                return result;
        }
    }
    /*  _________ Reject Friend Request __________    */
    static async rejectFriend(data: AcceptFriendRequest) {
        
        const   friendRequest = await prisma.friend.findUnique({
            where: {
                id: data.friendRequestId
            }
        });
        if(!friendRequest)
            throw new AppError('Not Found', 404);
        if(friendRequest.receiverId !== data.receiverId)
            throw new AppError('Not authorized', 403);
        console.log(`*************: ${data.receiverId}: ${friendRequest.receiverId}`);
        switch (friendRequest.status) {
            case FriendsStatus.ACCEPTED:
                throw new AppError('Request already accepted and cannot be rejected', 400);
            case FriendsStatus.REJECTED:
                return friendRequest;
            case FriendsStatus.PENDING:
                const result = await prisma.friend.update({
                    where: {
                        id: data.friendRequestId,
                        receiverId: data.receiverId
                    },
                    data: {
                        status: FriendsStatus.REJECTED
                    }
                });
                return result;
        }
    }
    /*  _________ Remove Friends Relation __________    */
    static async removeFriendShip(data: RemoveFriendShip){
        if (data.requesterId === data.friendId)
            throw new AppError('Friend Ship not found', 409);
        const   exist = await prisma.friend.findFirst({
            where: {
                receiverId: data.friendId,
                requesterId: data.requesterId
            }
        });
        if (!exist)
            throw new AppError('FriendShip not found', 404);
        switch (exist.status) {
            case FriendsStatus.PENDING:
                throw new AppError('No FriendShip exist yet(you can\'t remove it), you can just cancel it', 400);
            case FriendsStatus.REJECTED:
                throw new AppError('FriendShip already rejected', 409);
            case FriendsStatus.ACCEPTED:
                const   result = await prisma.friend.delete({
                    where: {
                        id: exist.id,
                        receiverId: data.friendId,
                        requesterId: data.requesterId,
                        status: FriendsStatus.ACCEPTED
                    }
                });
                return result;
        }
    }
    /*  _________ Cancel Friends Request __________    */
    static async cancelFriend(data: CancelFriendRequest) {
        const   existed = await prisma.friend.findUnique({
            where: {
                id: data.requestId
            }
        });
        if(!existed)
            throw new AppError('Request Not Found', 404);
        if (existed.requesterId !== data.requesterId)
            throw new AppError('Not authorized', 403);
        switch (existed.status) {
            case FriendsStatus.ACCEPTED:
                throw new AppError('Cannot Cancel FriendShip Request', 400)
            case FriendsStatus.REJECTED:
                throw new AppError('Cannot Cancel  Rejected Request', 400);
            case FriendsStatus.PENDING:
                const result = await prisma.friend.delete({
                    where: {
                        id: data.requestId,
                        requesterId: data.requesterId,
                        status: FriendsStatus.PENDING
                    }
                });
                return result;
        }
    }
    /*  _________ Get All FriendShip __________    */
    static async getFriends(userId: number | undefined) {
        const   friends = await prisma.friend.findMany({
            where: {
                OR: [
                    {requesterId: userId},
                    {receiverId: userId}
                ],
                status: FriendsStatus.ACCEPTED
            }
        });
        return friends;
    }
}