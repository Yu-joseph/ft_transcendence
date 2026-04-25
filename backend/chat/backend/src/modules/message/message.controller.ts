import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import  { response, Response }    from    'express';
import { ResponseModule } from "../shared.utils.js";
import { MessagesServices } from "./message.service.js";
import { MessageState, MessagesType, MessagesWithConvId, MessageToSendType } from "./message.types.js";
import { GetMessagesProps, MessagesPayload } from "../conversation/conversation.types.js";
import { AppError } from "../../utils/AppError.js";
import  sanitizeHtml    from    'sanitize-html';

export class MessagesController {
    /** @function getMessages getting all messages from single conversation */

    static async getMessagesByConvId(req: AuthenticatedRequest, res: Response) {
        try {
            const   currentUserId = req.user?.user_id;
            if (!currentUserId)
                return  res.status(401).json({message: 'Not authorized'});
            const   conversationId = req.params.convId as unknown as bigint;
            const   result: MessagesPayload[] = await MessagesServices.getMessagesByConvId({currentUserId, conversationId} as GetMessagesProps);
            const response: ResponseModule<MessagesPayload[]>  = {
                success: true,
                message: 'Getting messages',
                data: result
            };
            return res.status(200).json(response);

        } catch (error: any) {
            const   statusCode = error.statusCode || 500;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            const response: ResponseModule<null> = {
                success: false,
                message: errorMessage,
                data: null
            }
            return res.status(statusCode).json(response);
        }
    }
    static async getMessagesByFriendId(req: AuthenticatedRequest, res: Response) {
    try {
        const   currentUserId = req.user?.user_id;
        if (!currentUserId)
            return  res.status(401).json({message: 'Not authorized'});
        const   friendId = req.params.friendId as string;
        const   result: MessagesWithConvId = await MessagesServices.getMessagesByFriendId({currentUserId, friendId});
        const response: ResponseModule<MessagesWithConvId>  = {
            success: true,
            message: 'Getting friend messages',
            data: result
        };
        return res.status(200).json(response);

    } catch (error: any) {
        const   statusCode = error.statusCode || 500;
        let   errorMessage = 'Something went wrong'; 
        if(error instanceof AppError)
            errorMessage = error.message;
        const response: ResponseModule<null> = {
            success: false,
            message: errorMessage,
            data: null
        }
        return res.status(statusCode).json(response);
    }
}
    /** @function sendMessage sending single message to conversation */
    static async sendMessage(req: AuthenticatedRequest, res: Response) {
        const   response: ResponseModule<{tempId: string | null, status: MessageState | null }|null > = {
            success: false,
            message: '',
            data: null
        };
        let   temp_id: string | null = null;

        try {
            const   senderId = req.user?.user_id;
            const   conversationId = req.params.convId as unknown as bigint;
            const   content = req.body.content as string;
            const   tempId = req.body.tempId as string;
            temp_id = tempId;

            const   cleanContent = sanitizeHtml(content, {
                allowedTags: [],
                allowedAttributes: {},
            })

            const   result = await MessagesServices.sendMessage(senderId as string, conversationId, cleanContent, tempId);
            const   rspns: ResponseModule<MessagesPayload> = {
                
                success: true,
                message: 'messages sent successfully',
                data: {
                    id: result.id,
                    content: result.content,
                    created_at: result.created_at,
                    User: result.User,
                    tempId: tempId,
                    status: 'sent'
                }
            }
            return res.status(200).json(rspns);
        } catch (error: any) {
            const   statusCode = error.statusCode || 500;
            let   errorMessage = 'Something went wrong'; 
            if(error instanceof AppError)
                errorMessage = error.message;
            response.message = errorMessage;
            response.data  = { tempId: temp_id,  status: 'error' }
            return res.status(statusCode).json(response);
        }
    }
}