import  {ZodError, ZodObject} from    'zod';
import { Request, Response, NextFunction } from 'express';
import { ResponseModule } from '../modules/shared.utils.js';

export const    validateRequest = (schema: ZodObject<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const   dataToValidate = {
                body: req.body,
                params: req.params
            }
            const validatedData = await schema.parseAsync(dataToValidate);
            //after tge validation of my input, i just reassign the validate data to the request because some input i transform it in validation
            if(validatedData.body)
                req.body = validatedData.body;
            if(validatedData.params)
                req.params = validatedData.params;
            return next();
        } catch (error) {
            if(error instanceof ZodError) {
                const response: ResponseModule<null> = {
                    success: false,
                    message: 'validation failed',
                    data: null
                };
                return res.status(400).json(response)
            }
            return next(error);
        }
    }
}