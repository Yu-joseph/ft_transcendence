import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { UserProfileInfo } from "./profile.types.js";

export  class ProfileService {

    static async viewProfile(userId: string, currentUserId: string) {
        const   user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullname: true,
                created_at: true,
                avatar: true,
                status: true
            }
        }) as UserProfileInfo;
        if (!user)
            throw new AppError('User not found', 404);
        const   isFriend = await prisma.friend.findFirst({
            where: {
                OR: [{receiverId: userId, requesterId: currentUserId},
                    {receiverId: currentUserId, requesterId: userId}]
            },
            select: {id: true, status: true}
        });
        if(!isFriend) {
            user.isFriend = 'not';
            return user;
        }
        if(isFriend.status === 'REJECTED') {
            user.isFriend = 'not';
        }
        else {
            user.isFriend = isFriend.status === 'ACCEPTED' ? 'accepted' : 'pending';
        }
        return user;
    };
}