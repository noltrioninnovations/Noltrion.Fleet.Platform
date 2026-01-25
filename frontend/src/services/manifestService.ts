import {
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    updateTripStatus,
    updateJobStatus,
    uploadPod
} from './tripService';

// Re-exporting as Manifest Service to maintain domain language in the UI layer
export const getManifests = getTrips;
export const getManifestById = getTripById;
export const createManifest = createTrip;
export const updateManifest = updateTrip;
export const updateManifestStatus = updateTripStatus;
export const updateManifestJobStatus = updateJobStatus;
export const uploadManifestPod = uploadPod;
