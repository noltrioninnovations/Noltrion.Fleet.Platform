export interface Trip {
    id: string;
    tripNumber?: string;
    tripStatus: 'Planned' | 'Assigned' | 'StartTrip' | 'StartLoad' | 'CompleteLoad' | 'InTransit' | 'Delivery' | 'Completed' | 'Cancelled';
    vehicleId: string;
    vehicle?: {
        registrationNumber: string;
        model: string;
    };
    driverId?: string;
    driver?: {
        fullName: string;
        phoneNumber: string;
    };
    startTime?: string;
    endTime?: string;
    totalDistanceKm: number;
    totalCost: number;
    tripJobs: TripJob[];
    tripDate?: string;
    truckType?: string;
    helperName?: string;
    remarks?: string;
    chargesType?: string;
    numberOfTrips?: number;

    timeWindowFrom?: string;
    timeWindowTo?: string;
    proofOfDeliveryRequired?: boolean;
    proofOfDeliveryUrl?: string; // New field
    pickupLocation?: string;
    dropLocation?: string;
    packages?: TripPackage[];
    invoices?: Invoice[];
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: 'Accrued' | 'Invoiced' | 'PaymentReceived' | 'Cancelled';
    invoiceDate: string;
}

export interface TripPackage {
    id?: string; // Optional for new items
    packageType: string;
    quantity: number;
    volume?: number;
    noOfPallets?: number;
}

export interface TripJob {
    id: string;
    tripId: string;
    jobId: string;
    job?: {
        customerName: string;
        deliveryAddress: string;
        weightKg: number;
    };
    sequenceOrder: number;
    status: 'Pending' | 'PickedUp' | 'Delivered' | 'Skipped';
}
