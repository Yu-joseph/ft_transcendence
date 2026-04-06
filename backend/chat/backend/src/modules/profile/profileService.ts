import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";

export  class ProfileService {

    static async viewProfile(userId: number) {

        const   user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                username: true,
                created_at: true,
                avatar: true,
                status: true
            }
        });
        if (!user)
            throw new AppError('User not found', 404);
        return user;
    };
}