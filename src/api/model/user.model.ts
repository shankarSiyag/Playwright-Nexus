export interface user {
    id: string;
    name: string;
    email: string;
}
export interface UserResponse {
    data: user;
    message: string;
    success: boolean
}