export interface AddFriendResponse {
    success: boolean,
    message: string,
    data?: object
}

export interface AddFriendRequest {
    requesterId: string | undefined,
    receiverId: string
}

//** __ accept_friend_request __ */

export interface AcceptFriendRequest {
    receiverId: string
    friendRequestId: number
}

export interface RemoveFriendShip {
    requesterId: string
    friendId: string
}

export interface CancelFriendRequest {
    userId: string | undefined
    friendRequestId: number
}

export type RequestType = 'incoming' | 'outgoing';

export  interface PendingFriendType {
    friendRequestId: bigint
    status: string
    userInfo: {
        id: string
        username: string
        avatar: string | null
    }
    type: RequestType
}

export interface BlockedFriendType {
    id: string
    username: string
    avatar: string | null
}