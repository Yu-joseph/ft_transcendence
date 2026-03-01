export  interface AddFriendResponse {
    success: boolean,
    message: string,
    data?: object
}

export  interface   AddFriendRequest {
    requesterId: number | undefined,
    receiverId: number
}

//** __ accept_friend_request __ */

export  interface AcceptFriendRequest {
    receiverId: number | undefined
    friendRequestId: number
}