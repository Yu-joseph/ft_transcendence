import { z } from 'zod';

export const getMessagesByConvIdSchema = z.object({
  params: z.object({
    convId: z.string().regex(/^\d+$/, "Invalid conversation ID")
                      .transform((val) => val.trim())
  })
});

export  const getMessagesByFriendSchema = z.object({
  params: z.object({
    friendId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform(val => val.trim())
  })
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content cannot be empty.')
                       .max(100, 'Message too long (max 100 characters')
                       .transform(mess => mess.trim()),
    tempId: z.string().min(1, 'message ID is required')
                      .transform(t => t.trim())
  }),
  params: z.object({
    convId: z.string()
              .regex(/^\d+$/, 'Invalid conversation ID')
              .transform((val) => val.trim())
  })
});