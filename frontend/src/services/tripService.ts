import fleetApi from '../api/axios';
import type { ApiResult } from '../types/auth';
import type { Trip } from '../types/trip';

const API_URL = '/v1/web/trips';

export const getTrips = async (): Promise<Trip[]> => {
    const response = await fleetApi.get<ApiResult<Trip[]>>(API_URL);
    return response.data.data || [];
};

export const getTripById = async (id: string): Promise<Trip | null> => {
    const response = await fleetApi.get<ApiResult<Trip>>(`${API_URL}/${id}`);
    return response.data.data || null;
};

export const updateTripStatus = async (id: string, status: string) => {
    const response = await fleetApi.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
};

export const updateJobStatus = async (tripJobId: string, status: string) => {
    const response = await fleetApi.patch(`${API_URL}/jobs/${tripJobId}/status`, { status });
    return response.data;
};

export const createTrip = async (tripData: any) => {
    const response = await fleetApi.post(API_URL, tripData);
    return response.data;
};

export const updateTrip = async (id: string, tripData: any) => {
    const response = await fleetApi.put(`${API_URL}/${id}`, tripData);
    return response.data;
};

export const uploadPod = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Content-Type header is usually auto-set by browser when FormData is used, 
    // but fleetApi (axios) might need to know.
    const response = await fleetApi.post(`${API_URL}/${id}/pod`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
