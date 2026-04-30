export interface AddFriendResponse {
    success: boolean,
    message: string,
    data?: object
}

export interface AddFriendRequest {
    requesterId: string | undefined,
    friendUsername: string
}

//** __ accept_friend_request __ */

export interface AcceptFriendRequest {
    receiverId: string
    friendRequestId: string
}

export interface RemoveFriendShip {
    requesterId: string
    friendId: string
}

export interface CancelFriendRequest {
    userId: string | undefined
    friendRequestId: string
}

export type RequestType = 'incoming' | 'outgoing';

export  interface PendingFriendType {
    friendRequestId: string
    status: string
    userInfo: {
        id: string
        username: string
        avatar: string | null
        user_status: string
    }
    type: RequestType
}

export interface BlockedFriendType {
    id: string
    username: string
    avatar: string | null
    user_status: string
}