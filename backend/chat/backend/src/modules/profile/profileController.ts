import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import  { Response }      from  'express';
import { ResponseModule } from "../shared.utils.js";
import { ProfileService } from "./profileService.js";

export  class ProfileController {
    /**
     * @function viewProfile view user information
     */
    static async viewProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const   userId = Number(req.params.id);

            if (!Number.isInteger(userId) || userId <= 0) {
                const response: ResponseModule<null> = {
                    success: false, message: 'Invalid user ID', data: null
                };
                return res.status(400).json(response);
            }

            const   result = await ProfileService.viewProfile(userId);
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