import { Router } from "express";
import { authenticated } from "../../middlewares/auth.middleware.js";
import { FriendController } from "./friend.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { acceptFriendSchema, addFriendSchema, removeFriendShipSchema } from "./schema.validate.friend.js";

const routes = Router();




routes.get('/', authenticated, FriendController.getFriends);
routes.post('/request', validateRequest(addFriendSchema), authenticated, FriendController.addFriend);
routes.put('/:id/accept', validateRequest(acceptFriendSchema), authenticated, FriendController.acceptFriend);
routes.put('/:id/reject', validateRequest(acceptFriendSchema), authenticated, FriendController.rejectFriend);
routes.delete('/:id', validateRequest(removeFriendShipSchema), authenticated, FriendController.removeFriendShip); 
routes.delete('/:id/cancel', validateRequest(acceptFriendSchema), authenticated, FriendController.cancelFriend);
routes.get('/pending', authenticated, FriendController.getPendingFriend);
routes.get('/rejected', authenticated, FriendController.getRejectedFriend);

routes.get('/:id', validateRequest(removeFriendShipSchema), authenticated, FriendController.getFriendById); 

export  default routes;
