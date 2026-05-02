import  { Router }  from    'express';
import { ProfileController } from './profile.controller.js';
import { authenticated } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { removeFriendShipSchema } from '../friend/schema.validate.friend.js';
import z from 'zod';

const   routes = Router();

/**
 * Profile Schema
 */
const viewProfileSchema = z.object({
  params: z.object({ id: z.string().min(1, 'user ID is required')
                                  .min(3, 'user ID is too short')
                                  .max(255, 'user ID is too long')
                                  .transform(val => val.trim())
        })
});

/**
 * Profile Routes
 */

routes.get('/:id', validateRequest(viewProfileSchema), authenticated, ProfileController.viewProfile);


export default routes;
