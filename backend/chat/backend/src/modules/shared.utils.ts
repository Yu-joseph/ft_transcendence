
export  interface ResponseModule<T> {
    success: boolean
    message: string
    data: T | null
}