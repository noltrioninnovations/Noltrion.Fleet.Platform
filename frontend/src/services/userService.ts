import { authApi } from '../api/axios';
import type { ApiResult } from '../types/auth'; // Assuming ApiResult is shared

export interface User {
    id: string;
    username: string;
    email: string; // Added email
    firstName: string;
    lastName: string;
    isActive: boolean;
    userRoles: { role: { name: string; code: string } }[];
}

export interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    roleCode: string;
}

export interface UpdateUserRequest {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roleCode: string;
    isActive: boolean;
}

const getAll = async (): Promise<User[]> => {
    try {
        const response = await authApi.get<ApiResult<User[]>>('/users');
        if (response.data.succeeded || response.data.success) {
            return response.data.data || [];
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch users", error);
        return [];
    }
};

const create = async (user: CreateUserRequest): Promise<ApiResult<User>> => {
    try {
        const response = await authApi.post<ApiResult<User>>('/users', user);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { success: false, errors: ["Failed to create user"] };
    }
};

const update = async (id: string, user: UpdateUserRequest): Promise<ApiResult<User>> => {
    try {
        const response = await authApi.put<ApiResult<User>>(`/users/${id}`, user);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        return { success: false, errors: ["Failed to update user"] };
    }
};

const deleteUser = async (id: string): Promise<boolean> => {
    try {
        await authApi.delete(`/users/${id}`);
        return true;
    } catch (error) {
        return false;
    }
};

const resetPassword = async (id: string, newPassword: string): Promise<boolean> => {
    try {
        await authApi.post(`/users/${id}/reset-password`, { newPassword });
        return true;
    } catch (error) {
        return false;
    }
};

export const userService = {
    getAll,
    create,
    update,
    delete: deleteUser,
    resetPassword
};
