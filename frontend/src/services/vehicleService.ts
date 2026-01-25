
import api from '../api/axios';
import type { ApiResult } from '../types/auth';

const API_URL = '/v1/web/vehicles';

export interface Vehicle {
    id: string;
    registrationNumber: string;
    model: string;
    type: string;
    status: string;
}

export const getVehicles = async (): Promise<Vehicle[]> => {
    const response = await api.get<ApiResult<Vehicle[]>>(API_URL);
    return response.data.data || [];
};

export const createVehicle = async (vehicle: Partial<Vehicle>): Promise<ApiResult<Vehicle>> => {
    try {
        const response = await api.post<ApiResult<Vehicle>>(API_URL, vehicle);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
};

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>): Promise<ApiResult<string>> => {
    try {
        const response = await api.put<ApiResult<string>>(`${API_URL}/${id}`, vehicle);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            return error.response.data;
        }
        throw error;
    }
};

export const deleteVehicle = async (id: string): Promise<ApiResult<string>> => {
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
