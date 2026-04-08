import  { Router }  from    'express';
import { ProfileController } from './profileController.js';
import { authenticated } from '../../middlewares/auth.middleware.js';

const   routes = Router();

// routes.get('/me', authenticate, ProfileController.viewProfile);
routes.get('/:id', authenticated, ProfileController.viewProfile);
export default routes;
