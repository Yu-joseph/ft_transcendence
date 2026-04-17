import { pendingInvites } from "./onevoneState";

const INVITE_TTL_MS = 15000;


export function cleanupExpiredInvites() {
  const now = Date.now();
  for (const [inviteId, invite] of pendingInvites) {
    if (now - invite.createdAt > INVITE_TTL_MS) {
      pendingInvites.delete(inviteId);
    }
  }
}

export function removePendingInvitesForUser(userId: string) {
  for (const [inviteId, invite] of pendingInvites) {
    if (invite.fromUserId === userId || invite.toUserId === userId) {
      pendingInvites.delete(inviteId);
    }
  }
}