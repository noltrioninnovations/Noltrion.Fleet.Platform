export interface User {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    expiration: string;
    username: string;
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface ApiResult<T> {
    success: boolean;
    succeeded?: boolean;
    data?: T;
    errors?: string[];
    meta?: any;
}
