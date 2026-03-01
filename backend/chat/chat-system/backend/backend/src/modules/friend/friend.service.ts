import { AcceptFriendRequest, AddFriendRequest, AddFriendResponse } from "./friend.types.js";
import { prisma } from "../../lib/prisma.js";
import { FriendsStatus } from "../../../generated/prisma/index.js";
import { AppError } from "../../utils/AppError.js";

export  class FriendService {
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
}