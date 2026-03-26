import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import  { Response }    from    'express';
import { ResponseModule } from "../shared.utils.js";
import { MessagesServices } from "./message.service.js";

export class MessagesController {
    static async getMessages(req: AuthenticatedRequest, res: Response) {
        try {
            const   currentUserId = req.user?.id;
            const   conversationId = Number(req.params.id);
    
            if (!Number.isInteger(conversationId) || conversationId <= 0) {
                const   response: ResponseModule<null> = {
                    success: false,
                    message: 'Invalid Conversation ID',
                    data: null
                };
                return res.status(400).json(response);
            }
            const   result = await MessagesServices.getMessages({currentUserId, conversationId});
            const response  = {
                success: true,
            }

        } catch (error: any) {
            const   statusCode = error.statusCode || 500;
            const response: ResponseModule<null> = {
                success: false,
                message: error.message || 'Internal server error',
                data: null
            }
            return res.status(statusCode).json(response);
        }
    }
}