import prisma from "../../lib/prisma";

type UserProfile = {
  username: string;
  avatar: string | null;
};

const MEDIA_PREFIX = "/media";

function withMediaPrefix(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
  if (avatar.startsWith(MEDIA_PREFIX)) return avatar;
  if (avatar.startsWith("/")) return `${MEDIA_PREFIX}${avatar}`;
  return `${MEDIA_PREFIX}/${avatar}`;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, avatar: true },
  });

  if (!user) return null;

  return {
    username: user.username,
    avatar: withMediaPrefix(user.avatar ?? null),
  };
}