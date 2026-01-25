import api from '../api/axios';
import type { ApiResult } from '../types/auth';

const API_URL = '/v1/web/organizations';

export interface Organization {
    id: string;
    code: string;
    name: string;
    address: string;
    isActive: boolean;
    createdOn?: string;
    createdBy?: string;
    modifiedOn?: string;
    modifiedBy?: string;
}

export interface OrganizationCreate {
    code: string;
    name: string;
    address: string;
    isActive: boolean;
}

export const getOrganizations = async (): Promise<Organization[]> => {
    const response = await api.get<ApiResult<Organization[]>>(API_URL);
    return response.data.data || [];
};

export const getOrganization = async (id: string): Promise<Organization> => {
    const response = await api.get<ApiResult<Organization>>(`${API_URL}/${id}`);
    if (response.data.succeeded && response.data.data) return response.data.data;
    throw new Error(response.data.errors ? response.data.errors[0] : 'Failed to fetch organization');
};

export const createOrganization = async (data: OrganizationCreate): Promise<ApiResult<string>> => {
    try {
        const response = await api.post<ApiResult<string>>(API_URL, data);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
};

export const updateOrganization = async (id: string, data: OrganizationCreate): Promise<ApiResult<string>> => {
    try {
        const response = await api.put<ApiResult<string>>(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
};

export const deleteOrganization = async (id: string): Promise<ApiResult<string>> => {
    try {
        const response = await api.delete<ApiResult<string>>(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) return error.response.data;
        throw error;
    }
};
