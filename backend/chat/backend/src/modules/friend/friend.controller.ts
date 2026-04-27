import {
    PendingFriendType
} from './friend.types.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { Response } from 'express';
import { FriendService } from './friend.service.js';
import { AppError } from '../../utils/AppError.js';

export class FriendController {
    /*  _________ Add Friend Request __________    */
    
    static async addFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const requesterId = req.user?.user_id;
            if(!requesterId)
                return res.status(401).json({message: "Aunothorized"});
            const   friendUsername: string = req.body.username;
            console.log(`Username:${friendUsername}`);
            const result = await FriendService.addFriend({ requesterId, friendUsername });

            return res.status(201).json({
                success: true,
                message: 'Friend request created',
                data: result
            });

        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            console.error(errorMessage);
            return res.status(statusCode).json({
                success: false,
                message: errorMessage
            })
        }
    }
    /*  _________ Accept Friend Request __________    */
    static async acceptFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const receiverId = req.user?.user_id;
            if(!receiverId)
                return res.status(401).json({message: 'Not authorized'});
            const friendRequestId = req.params.id as unknown as bigint;
            const result = await FriendService.acceptFriend({ receiverId, friendRequestId });
            return res.status(200).json({
                success: true,
                message: 'Friend request accepted',
                data: result
            })

        } catch (error: any) {
            const statusCode = error.statusCode;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            console.error(errorMessage);
            return res.status(statusCode || 500).json({
                success: false,
                message: errorMessage
            })
        }
    }
    /*  _________ Reject Friend Request __________    */
    static async rejectFriend(req: AuthenticatedRequest, res: Response) {
        try {
            
            const receiverId = req.user?.user_id;
            if (!receiverId)
                return res.status(401).json({message: 'Not authorized'});
            const friendRequestId = req.params.id as unknown as bigint;
            const result = await FriendService.rejectFriend({ receiverId, friendRequestId });

            return res.status(200).json({
                success: true,
                message: 'Friend request Rejected',
                data: result
            });
        } catch (error: any) {
            const statusCode = error.statusCode;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            return res.status(statusCode || 500).json({
                success: false,
                message: errorMessage
            });
        }
    }
    /*  _________ Remove Friends Relation __________    */
    static async removeFriendShip(req: AuthenticatedRequest, res: Response) {
        try {
            const requesterId = req.user?.user_id;
            if(!requesterId)
                return res.status(401).json({message: 'Not authorized'});
            const friendId = req.params.id as string;
            const result = await FriendService.removeFriendShip({ requesterId, friendId });
            return res.status(200).json({
                success: true,
                message: 'FriendShip removed',
                data: result
            })
        } catch (error: any) {
            const statusCode = error.statusCode;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            return res.status(statusCode || 500).json({
                success: false,
                message: errorMessage
            })
        }
    }
    /*  _________ Cancel Friends Request __________    */
    static async cancelFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.user_id;
            if(!userId)
                return res.status(401).json({message: 'Not Authorized'});
            const friendRequestId = req.params.id as unknown as bigint;
            const result = await FriendService.cancelFriend({ userId, friendRequestId })
            return res.status(200).json({
                success: true,
                message: 'Friend request canceled successfully',
                data: result
            })
        } catch (error: any) {
            const statusCode = error.statusCode;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            console.log(errorMessage);
            return res.status(statusCode || 500).json({
                success: false,
                message: errorMessage
            });
        }
    }
    /*  _________ Get All FriendShip __________    */
    static async getFriends(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.user_id;
            if(!userId)
                return res.status(401).json({message: 'Unauthorized'});
            const result = await FriendService.getFriends(userId);
            return res.status(200).json({
                success: true,
                message: 'FriendShip list',
                data: result
            })
        } catch (error: any) {
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            console.log("error", errorMessage);
            return res.status(500).json({
                success: false,
                message: errorMessage
            })
        }
    }
    /*  _________ Get Rejected FriendShip __________    */
    static async getRejectedFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.user_id;
            if(!userId)
                return res.status(401).json({message: 'Not Authorized'});
            const result = await FriendService.getRejectedFriend(userId);
            return res.status(200).json({
                success: true,
                message: 'Rejected request',
                data: result
            })
        } catch (error: any) {
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
    /*  _________ Get PENDING FriendShip __________    */
    static async getPendingFriend(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.user?.user_id;
            if(!userId)
                return res.status(401).json({message: 'Aunothorized'});
            const result : PendingFriendType[] = await FriendService.getPendingFriend(userId);
            console.log("Pending request:", result);
            return res.status(200).json({
                success: true,
                message: 'Pending request',
                data: result
            })
        } catch (error: any) {
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
    static async getFriendById(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.user_id;
            if(!userId)
                return res.status(401).json({message: "Aunothorized"});
            const   friendId = req.params.id as string;

            const result = await FriendService.getFriendById(userId, friendId);
            return res.status(200).json({
                success: true,
                message: 'Friend Info geted',
                data: result
            });
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            console.error(errorMessage);
            return res.status(statusCode).json({
                success: false,
                message: errorMessage
            })
        }
    }
}
