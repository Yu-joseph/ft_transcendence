import  {z} from    'zod';

export const startConversationSchema = z.object({
  // friendId is my friendID and represented as string in shema models
    body: z.object({
        friendId: z.string().min(1, 'friend ID is required')
                            .min(3, 'friend ID is too short')
                            .max(255, 'friend ID is too long')
                            .transform((val: string) => val.trim())
    })
});

export const deleteConversationSchema = z.object({
  // convId is the id of conversation Model in prisma schema, and represnted as bigint
    params: z.object({
        convId: z.string().regex(/^\d+$/, 'Invalid conversation ID')
                          .transform((val: string) => val.trim())
    })
});
 