import { z } from 'zod';

const MAX_MESSAGE_CONTENT = 500;

export const getMessagesByConvIdSchema = z.object({
  params: z.object({
    convId: z.string().regex(/^\d+$/, "Invalid conversation ID")
                      .transform((val: string) => val.trim())
  })
});

export  const getMessagesByFriendSchema = z.object({
  params: z.object({
    friendId: z.string().min(1, 'friend ID is required')
                        .min(3, 'friend ID is too short')
                        .max(255, 'friend ID is too long')
                        .transform((val: string) => val.trim())
  })
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content cannot be empty.')
                       .max(MAX_MESSAGE_CONTENT, `Message too long (max ${MAX_MESSAGE_CONTENT} characters`)
                       .transform((mess: string) => mess.trim()),
    tempId: z.string().min(1, 'message ID is required')
                      .transform((val: string) => val.trim())
  }),
  params: z.object({
    convId: z.string()
              .regex(/^\d+$/, 'Invalid conversation ID')
              .transform((val: string) => val.trim())
  })
});