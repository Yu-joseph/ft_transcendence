import { AuthenticatedRequest } from "../../middlewares/auth.middleware.js";
import  { response, Response }    from    'express';
import { ResponseModule } from "../shared.utils.js";
import { MessagesServices } from "./message.service.js";
import { MessageState, MessagesType, MessagesWithConvId, MessageToSendType } from "./message.types.js";
import { GetMessagesProps, MessagesPayload } from "../conversation/conversation.types.js";

export class MessagesController {
    /** @function getMessages getting all messages from single conversation */

    static async getMessagesByConvId(req: AuthenticatedRequest, res: Response) {
        try {
            const   currentUserId = req.user?.user_id;
            if (!currentUserId)
                return  res.status(401).json({message: 'Not authorized'});
            const   conversationId = Number(req.params?.convId) ;
            if (!Number.isInteger(conversationId) || conversationId <= 0) {
                const   response: ResponseModule<null> = {
                    success: false,
                    message: 'Invalid Conversation ID',
                    data: null
                };
                return res.status(400).json(response);
            }
            const   result: MessagesPayload[] = await MessagesServices.getMessagesByConvId({currentUserId, conversationId} as GetMessagesProps);
            const response: ResponseModule<MessagesPayload[]>  = {
                success: true,
                message: 'Getting messages',
                data: result
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
    static async getMessagesByFriendId(req: AuthenticatedRequest, res: Response) {
    try {
        // const   {userId} = getAuth(req);
        
        const   currentUserId = req.user?.user_id;
        if (!currentUserId)
            return  res.status(401).json({message: 'Not authorized'});
        const   friendId = req.params?.friendId as string;
        // if (!Number.isInteger(friendId) || friendId <= 0) {
        //     const   response: ResponseModule<null> = {
        //         success: false,
        //         message: 'Invalid Conversation ID',
        //         data: null
        //     };
        //     return res.status(400).json(response);
        // }
        const   result: MessagesWithConvId = await MessagesServices.getMessagesByFriendId({currentUserId, friendId});
        const response: ResponseModule<MessagesWithConvId>  = {
            success: true,
            message: 'Getting friend messages',
            data: result
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
        const   response: ResponseModule<{tempId: string | null, status: MessageState | null }|null > = {
            success: false,
            message: '',
            data: null
        };
        let   temp_id: string | null = null;

        try {
            const   senderId = req.user?.user_id;
            const   conversationId = Number(req.params.convId);
            const   content = req.body?.content as string;
            const   tempId = req.body?.tempId as string;
            temp_id = tempId;
            // const   status = req.body?.status as MessageState

            if (!Number.isInteger(conversationId) || conversationId <= 0) {
                console.log("ConversationId:", conversationId);
                response.message = 'Invalid conversation ID';
                response.data  = { tempId: tempId,  status: 'error' }
                return res.status(400).json(response);
            }
            if
            (!tempId || tempId.trim().length === 0) {
                response.message = 'Invalid message ID';
                response.data  = { tempId: tempId,  status: 'error' }
                return res.status(400).json(response);
            }
            if (typeof content !== 'string' || content.trim().length === 0) {
                response.message = 'Message content cannot be empty';
                response.data  = { tempId: tempId,  status: 'error' }
                return res.status(400).json(response);
            }
            if (content.length > 1000) {
                response.message = 'message too long (max 1000 characters)';
                response.data  = { tempId: tempId,  status: 'error' }
                return res.status(400).json(response);
            }
            const   result = await MessagesServices.sendMessage(senderId as string, conversationId, content);
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
            response.message = error.message || 'Internal server error'
            response.data  = { tempId: temp_id,  status: 'error' }
            return res.status(statusCode).json(response);
        }
    }
}