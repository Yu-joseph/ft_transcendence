import prisma from "../../lib/prisma";

type UserProfile = {
  username: string;
  avatar: string | null;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, avatar: true },
  });

  if (!user) return null;

  return {
    username: user.username,
    avatar: user.avatar ?? null,
  };
}