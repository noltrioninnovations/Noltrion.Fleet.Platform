export interface Job {
    id: string;
    customerName: string;
    pickupAddress: string;
    deliveryAddress: string;
    weightKg: number;
    volumeCbm: number;
    requiredVehicleType: string;
    status: string;
    specialInstructions?: string;
}

export interface TripCandidate {
    jobIds: string[];
    jobs: Job[];
    vehicleId?: string;
    driverId?: string;
    utilizationScore: number;
    totalDistance: number;
    estimatedCost: number;
    estimatedDuration: string;
}

export interface PlanningResult {
    trips: TripCandidate[];
    unplannedJobs: Job[];
}
