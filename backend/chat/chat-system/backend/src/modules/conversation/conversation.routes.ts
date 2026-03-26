import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { ConversationController } from "./conversation.controller.js";

const routes = Router();

/**
 * @ Conversation routes
 */
routes.get(
  "/conversations",
  authenticate,
  ConversationController.listConversations
);

routes.post(
  "/conversations",
  authenticate,
  ConversationController.startConversation
);

routes.delete(
  "/conversations/:id",
  authenticate,
  ConversationController.deleteConversation
);

/**
 * @ Messages routes
 * Placeholder for messages route; replace with actual handler when implemented
 */
routes.get(
  "/conversations/:id/messages",
  authenticate,
  ConversationController.getMessages || ((req, res) => {
    res.status(200).json({ message: "Not implemented yet" });
  })
);

export default routes;