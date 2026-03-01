import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { FriendController } from "./friend.controller.js";
const routes = Router();


// routes.get('/', (req, res) => {
// 	console.log('I reach friend list...');
// 	res.json({ message: 'I reach friend list...' });
// });

routes.post('/request', authenticate, FriendController.addFriend);
routes.put('/:id/accept', authenticate, FriendController.acceptFriend);
routes.put('/:id/reject', authenticate, FriendController.rejectFriend);
// routes.get('/', authenticate, );


export  default routes;