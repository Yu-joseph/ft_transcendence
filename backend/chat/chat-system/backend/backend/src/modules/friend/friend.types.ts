export  interface AddFriendResponse {
    success: boolean,
    message: string,
    data?: object
}

export  interface   AddFriendRequest {
    requesterId: number | undefined,
    receiverId: number
}