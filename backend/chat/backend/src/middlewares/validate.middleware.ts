import  {ZodError, ZodObject} from    'zod';
import { Request, Response, NextFunction } from 'express';
import { ResponseModule } from '../modules/shared.utils.js';

export const    validateRequest = (schema: ZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const   dataToValidate: Record<string, any> = {};
            if(schema.shape.body)
                dataToValidate.body = req.body;
            if(schema.shape.params)
                dataToValidate.params = req.params;
            await schema.parseAsync(dataToValidate);
            //after tge validation of my input, i just reassign the validate data to the request because some input i transform it in validation
            if(dataToValidate.body)
                req.body = dataToValidate.body;
            if(dataToValidate.params)
                req.params = dataToValidate.params;
            return next();
        } catch (error) {
            if(error instanceof ZodError) {
                const response: ResponseModule<null> = {
                    success: false,
                    message: 'validation failed',
                    data: null
                };
                return res.status(400).json({response})
            }
            return next(error);
        }
    }
}