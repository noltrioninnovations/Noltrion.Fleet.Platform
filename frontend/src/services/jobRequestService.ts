import api from '../api/axios';

export interface CreateJobRequestDto {
    preferredDate: string; // ISO date
    pickupLocation: string;
    dropLocation: string;
    cargoDescription: string;
    volume?: number;
    weight?: number;
}

export interface JobRequest {
    id: string;
    customerId: string;
    preferredDate: string;
    pickupLocation: string;
    dropLocation: string;
    cargoDescription: string;
    volume?: number;
    weight?: number;
    requestStatus: 'Submitted' | 'Converted' | 'Rejected';
    createdAt: string;
    tripId?: string;
    trip?: any; // Full object if expanded
}

export const getMyRequests = async (): Promise<JobRequest[]> => {
    const response = await api.get('/job-requests/my-requests');
    return response.data;
};

export const getPendingRequests = async (): Promise<JobRequest[]> => {
    const response = await api.get('/job-requests/pending');
    return response.data;
};

export const createJobRequest = async (data: CreateJobRequestDto): Promise<JobRequest> => {
    const response = await api.post('/job-requests/create', data);
    return response.data;
};

export const convertToManifest = async (requestId: string): Promise<{ tripId: string }> => {
    const response = await api.post(`/job-requests/${requestId}/convert`);
    return response.data;
};
