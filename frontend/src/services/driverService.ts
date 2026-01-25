import api from '../api/axios';
import type { ApiResult } from '../types/auth';

const API_URL = '/v1/web/drivers';

export interface Driver {
    id: string;
    name: string;
    licenseNumber: string;
    phone: string;
    status: string;
}

export const getDrivers = async (): Promise<Driver[]> => {
    const response = await api.get<ApiResult<Driver[]>>(API_URL);
    return response.data.data || [];
};

export const createDriver = async (driver: Partial<Driver>): Promise<ApiResult<Driver>> => {
    try {
        const response = await api.post<ApiResult<Driver>>(API_URL, driver);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
};

export const updateDriver = async (id: string, driver: Partial<Driver>): Promise<ApiResult<string>> => {
    try {
        const response = await api.put<ApiResult<string>>(`${API_URL}/${id}`, driver);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
};

export const deleteDriver = async (id: string): Promise<ApiResult<string>> => {
    try {
        const response = await api.delete<ApiResult<string>>(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
};
