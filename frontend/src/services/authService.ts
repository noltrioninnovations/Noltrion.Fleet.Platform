import { authApi } from '../api/axios';
import type { LoginRequest, AuthResponse, ApiResult } from '../types/auth';

const login = async (credentials: LoginRequest): Promise<ApiResult<AuthResponse>> => {
    try {
        const response = await authApi.post<ApiResult<AuthResponse>>('/auth/login', credentials);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return {
            success: false,
            errors: ['An unexpected error occurred']
        };
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

export const authService = {
    login,
    logout,
    getCurrentUser
};
