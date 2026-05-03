import { Router } from "express";
import { authenticated } from "../../middlewares/auth.middleware.js";
import { ConversationController } from "./conversation.controller.js";
import { MessagesController } from "../message/message.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { startConversationSchema } from "./schema.validate.conv.js";
import { getMessagesByConvIdSchema, getMessagesByFriendSchema, sendMessageSchema } from "../message/schema.validate.message.js";
import { messageLimiter } from "../../middlewares/message.rate.limit.midllware.js";

const   routes = Router();
/**
 * @ conversation routesges
 * 
 */


routes.get('/conversations', authenticated, ConversationController.listConversations);
routes.post('/conversations', validateRequest(startConversationSchema), authenticated, ConversationController.startConversation);
// routes.delete('/conversations/:convId', validateRequest(deleteConversationSchema), authenticated, ConversationController.deleteConversation);

/**
 * @ messages routes
 */

routes.get('/conversations/:convId/messages', validateRequest(getMessagesByConvIdSchema), authenticated, MessagesController.getMessagesByConvId);
routes.get('/friend/:friendId/messages', validateRequest(getMessagesByFriendSchema), authenticated, MessagesController.getMessagesByFriendId);

routes.post('/conversations/:convId/message', validateRequest(sendMessageSchema), authenticated, messageLimiter, MessagesController.sendMessage);

export default routes;