import { AddFriendRequest, AddFriendResponse } from "./friend.types.js";
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
            throw new AppError('user Not Found', 404);
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
}