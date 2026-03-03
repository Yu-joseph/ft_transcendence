import  { 
    AddFriendRequest,
    AddFriendResponse
}                          from    './friend.types.js';
import  { AuthenticatedRequest }    from    '../../middlewares/auth.middleware.js';
import  { Response }       from    'express';
import  { FriendService }   from    './friend.service.js';

export class FriendController {
    /*  _________ Add Friend Request __________    */
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
    /*  _________ Accept Friend Request __________    */
    static async acceptFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   receiverId = req.user?.id;
            const   friendRequestId = Number(req.params.id);
            if(!Number.isInteger(friendRequestId) || friendRequestId < 0)
                return res.status(400).json({success: false, message: 'Bad Request ID'});
            const   result = await FriendService.acceptFriend({receiverId, friendRequestId});
            
            return res.status(200).json({
                success: true,
                message: 'Friend request accepted',
                data: result
            })

        } catch (error: any) {
            const   statusCode = error.statusCode;
            console.error(error.message || 'Internal server error');
            return res.status(statusCode || 500).json({
                success: false,
                message: error.message || 'Internal server error'
            })
        }


    }
    /*  _________ Reject Friend Request __________    */
    static async rejectFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   receiverId = req.user?.id;
            const   friendRequestId = Number(req.params.id);
            if (!Number.isInteger(friendRequestId) || friendRequestId <= 0) {
                return res.status(400).json({success: false, message: 'Bad request ID'});
            }
            const   result = await FriendService.rejectFriend({receiverId, friendRequestId});
            
            return res.status(200).json({
                success: true,
                message: 'Friend request Rejected',
                data: result
            })

        } catch (error: any) {
            const   statusCode = error.statusCode;
            return res.status(statusCode || 500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
    /*  _________ Remove Friends Relation __________    */
    static async removeFriendShip(req: AuthenticatedRequest, res: Response) {
        try {
            const   requesterId = req.user?.id;
            const   friendId = Number(req.params.id);
            console.log(friendId);
            if (!Number.isInteger(friendId) || friendId <= 0)
                return res.status(400).json({success: false, message: 'Bad request ID'});
            const   result = await FriendService.removeFriendShip({requesterId, friendId});
            return res.status(200).json({
                success: true,
                message: 'FriendShip removed',
                data: result
            })
        } catch (error: any) {
            const   statusCode = error.statusCode;
            return res.status(statusCode || 500).json({
                success: false,
                message: error.message || 'Internal server error'
            })
        }
    }
    /*  _________ Cancel Friends Request __________    */
    static async cancelFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   requesterId = req.user?.id;
            const   requestId = Number(req.params.id);
            if (!Number.isInteger(requestId) || requestId <= 0)
                return res.status(400).json({success: false, message: 'Bad request ID'});

            const   result = await FriendService.cancelFriend({requesterId, requestId})
            return res.status(200).json({
                success: true,
                message: 'Friend request canceled successfully',
                data: result
            })
        } catch (error: any) {
            const   statusCode = error.statusCode;
            console.log(error.message || 'Internal server error');
            return res.status(statusCode || 500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
    /*  _________ Get All FriendShip __________    */
    static async getFriends(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.id;
            const   result = await FriendService.getFriends(userId);
            return res.status(200).json({
                success: true,
                message: 'FriendShip',
                data: result
            })
        } catch (error : any) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            })
        }
    }
    /*  _________ Get Rejected FriendShip __________    */
    static async getRejectedFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.id;
            const   result = await FriendService.getRejectedFriend(userId);
            return res.status(200).json({
                success: true,
                message: 'Rejected request',
                data: result
            })
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
        /*  _________ Get PENDING FriendShip __________    */
    static async getPendingFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.id;
            const   result = await FriendService.getPendingFriend(userId);
            return res.status(200).json({
                success: true,
                message: 'Pending request',
                data: result
            })
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
}
