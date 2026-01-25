import fleetApi from '../api/axios';
import type { ApiResult } from '../types/auth';

export interface InvoiceLine {
    id: string;
    description: string;
    amount: number;
    taxAmount: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    tripId: string;
    totalAmount: number;
    totalTax: number;
    status: 'Draft' | 'Approved' | 'Accrued' | 'Invoiced' | 'PaymentReceived' | 'Cancelled';
    lines: InvoiceLine[];
}

const API_URL = '/v1/web/invoices';

export const getInvoices = async (): Promise<Invoice[]> => {
    try {
        const response = await fleetApi.get<Invoice[]>(API_URL); // Controller returns List<InvoiceDto> directly wrapped in Ok() or we should check if BaseApiController wrapping applies.
        // BaseApiController usually wraps in ApiResult if we used HandleResult, but for GetAll we returned Ok(await...).
        // Wait, looking at InvoiceController.cs: return Ok(await ...);
        // The return type of Service is List<InvoiceDto>. So Ok() wraps List<InvoiceDto>.
        // So response.data is List<InvoiceDto>.
        return response.data;
    } catch (error) {
        return [];
    }
};

export const getInvoiceByTripId = async (tripId: string): Promise<Invoice | null> => {
    try {
        const response = await fleetApi.get<ApiResult<Invoice>>(`${API_URL}/trip/${tripId}`);
        return response.data.data;
    } catch (error) {
        return null; // Return null if not found (404)
    }
};

export const generateInvoice = async (tripId: string): Promise<Invoice | null> => {
    const response = await fleetApi.post<ApiResult<Invoice>>(`${API_URL}/generate/${tripId}`);
    return response.data.data;
};

export const updateInvoiceStatus = async (id: string, status: string): Promise<boolean> => {
    const response = await fleetApi.patch<ApiResult<boolean>>(`${API_URL}/${id}/status`, { status });
    return response.data.data || false;
};

export const updateInvoice = async (invoice: Invoice): Promise<boolean> => {
    const response = await fleetApi.put<ApiResult<boolean>>(`${API_URL}/${invoice.id}`, invoice);
    return response.data.data || false;
};
