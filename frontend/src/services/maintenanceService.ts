
export interface MaintenanceRecord {
    id: string;
    vehicleId: string;
    description: string;
    date: string;
    cost: number;
    odometer: number;
    type: 'Service' | 'Repair' | 'Inspection' | 'TireChange' | 'Other';
    performedBy?: string;
}

const STORAGE_KEY = 'fleetx_maintenance_records';

export const getMaintenanceRecords = (vehicleId: string): MaintenanceRecord[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const records = JSON.parse(stored) as MaintenanceRecord[];
        return records.filter(r => r.vehicleId === vehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error('Failed to load maintenance records', error);
        return [];
    }
};

export const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const records = stored ? JSON.parse(stored) as MaintenanceRecord[] : [];

        const newRecord: MaintenanceRecord = {
            ...record,
            id: crypto.randomUUID()
        };

        const updatedRecords = [...records, newRecord];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
        return newRecord;
    } catch (error) {
        console.error('Failed to save maintenance record', error);
        throw error;
    }
};

export const updateMaintenanceRecord = (updatedRecord: MaintenanceRecord): MaintenanceRecord => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let records = stored ? JSON.parse(stored) as MaintenanceRecord[] : [];

        const index = records.findIndex(r => r.id === updatedRecord.id);
        if (index !== -1) {
            records[index] = updatedRecord;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
            return updatedRecord;
        }
        throw new Error("Record not found");
    } catch (error) {
        console.error('Failed to update maintenance record', error);
        throw error;
    }
};

// Seed some initial data if empty for demo purposes
export const seedMaintenanceData = (vehicleId: string) => {
    const existing = getMaintenanceRecords(vehicleId);
    if (existing.length === 0) {
        const demoData: MaintenanceRecord[] = [
            {
                id: crypto.randomUUID(),
                vehicleId,
                description: 'Regular Oil Change',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
                cost: 1500,
                odometer: 115000,
                type: 'Service',
                performedBy: 'Fleet Workshop'
            },
            {
                id: crypto.randomUUID(),
                vehicleId,
                description: 'Brake Pad Replacement',
                date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), // 90 days ago
                cost: 4500,
                odometer: 110000,
                type: 'Repair',
                performedBy: 'AutoFix Center'
            }
        ];

        const stored = localStorage.getItem(STORAGE_KEY);
        const records = stored ? JSON.parse(stored) as MaintenanceRecord[] : [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...records, ...demoData]));
    }
};
