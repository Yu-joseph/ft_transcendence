import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import  { Response }      from  'express';
import { ResponseModule } from "../shared.utils.js";
import { ProfileService } from "./profile.service.js";

export  class ProfileController {
    /**
     * @function viewProfile view user information
     */
    static async viewProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = req.params.id as string;
            const   currentUserId = req.user?.user_id as string;

            if (!userId) {
                const response: ResponseModule<null> = {
                    success: false, message: 'Invalid user ID', data: null
                };
                return res.status(400).json(response);
            }

            const   result = await ProfileService.viewProfile(userId, currentUserId);
            const   response: ResponseModule<object> = {
                success: true,
                message: 'User info retrieved successfully',
                data: result
            };
            return res.status(200).json(response);

        } catch (error: any) {
            const   response: ResponseModule<null> = {
                success: false,
                message: error.message || 'Internal server error',
                data: null
            };
            return res.status(error.statusCode || 500).json(response);
        }
    }

}