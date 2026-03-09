import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import  { response, Response }    from    'express';
import { ResponseModule } from "../shared.utils.js";
import { MessagesServices } from "./message.service.js";
import { MessagesType } from "./message.types.js";

export class MessagesController {
    /** @function getMessages getting all messages from single conversation */

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
            const response: ResponseModule<MessagesType>  = {
                success: true,
                message: 'Getting messages',
                data: {
                    id: result?.id as number,
                    messages: result?.messages
                }
            };
            return res.status(200).json(response);

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
    /** @function sendMessage sending single message to conversation */
    static async sendMessage(req: AuthenticatedRequest, res: Response) {
        const   response: ResponseModule<null> = {
            success: false,
            message: '',
            data: null
        };
        try {
            const   senderId = req.user?.id;
            const   conversationId = Number(req.params.id);
            console.log("-----------1111111111111---------");
            const   {content} = req.body;
            
            console.log("-----------222222222222222222---------");


            if (!Number.isInteger(conversationId) || conversationId <= 0) {
                response.message = 'Invalid conversation ID'
                return res.status(400).json(response);
            }
            if (typeof content !== 'string' || content.trim().length === 0) {
                response.message = 'Message content cannot be empty';
                return res.status(400).json(response);
            }
            if (content.length > 1000) {
                response.message = 'message too long (max 1000 characters)';
                return res.status(400).json(response);
            }
            const   result = await MessagesServices.sendMessage(senderId as number, conversationId, content);
            const   rspns: ResponseModule<object> = {
                success: true,
                message: 'messages sent successfully',
                data: {
                    id: result.id,
                    content: result.content,
                    created_at: result.created_at,
                    conversationId: result.conversationId,
                    sender: result.sender
                }
            }
            return res.status(200).json(rspns);
        } catch (error: any) {
            const   statusCode = error.statusCode || 500;
            response.message = error.message || 'Internal server error'
            return res.status(statusCode).json(response);
        }
    }
}