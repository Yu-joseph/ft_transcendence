const MEDIA_PREFIX = "/media";

export function withMediaPrefix(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
  if (avatar.startsWith(MEDIA_PREFIX)) return avatar;
  
  if (avatar.startsWith("/media/")) {
      return `/authent${avatar}`;
  }
  
  if (avatar.startsWith("/")) return `${MEDIA_PREFIX}${avatar}`;
  return `${MEDIA_PREFIX}/${avatar}`;
}
