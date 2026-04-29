import  {z} from  'zod';

export  const addFriendSchema = z.object({
  body: z.object({
    username: z.string()
                .min(1, 'username is required')
                .max(50, 'username too long')
                .transform(name => name.trim())
  })
});

export  const acceptFriendSchema = z.object({
  // id is the id of friend Model in prisma schema, and represnted as bigint
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid friend request ID')
                  .transform(val => val.trim())
  })
});

export  const removeFriendShipSchema = z.object({
  // id is my friendID and represented as string in shema models
  params: z.object({
    id: z.string()
          .min(1, 'friend ID is required')
          .min(3, 'friend ID is too short')
          .max(255, 'friend ID is too long')
          .transform(val => val.trim())
  })
});