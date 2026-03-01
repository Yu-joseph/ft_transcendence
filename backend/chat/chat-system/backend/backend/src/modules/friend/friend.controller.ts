import  { 
    AddFriendRequest,
    AddFriendResponse
}                          from    './friend.types.js';
import  { AuthenticatedRequest }    from    '../../middlewares/auth.middleware.js';
import  { Response }       from    'express';
import  { FriendService }   from    './friend.service.js';

export class FriendController {
    static async addFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   requesterId = req.user?.id;

            const   receiverId = Number(req.body.receiverId as any);
            if (!Number.isInteger(receiverId) || receiverId < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid friendId'
                });
            }
            const result = await FriendService.addFriend({requesterId, receiverId});
            return res.status(201).json({
                success: true,
                message: 'Friend request created',
                data: result
            });
            
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            console.error(error.message);
            return res.status(statusCode).json({
                success: false,
                message: error.message || 'Internal Server Error'
            })
        }


    }
    // static async acceptFriend(req: AuthenticatedRequest, res: Response) {
    //     try {
            
    //     } catch (error) {
            
    //     }


    // }
}
