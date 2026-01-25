import React, { useEffect, useState } from 'react';
import { getLiveLocations } from '../../services/trackingService';
import type { VehicleLocation } from '../../services/trackingService';
import { RefreshCw, MapPin } from 'lucide-react';
import { MapDisplay } from '../../components/ui/MapDisplay';

export const TrackingDashboard: React.FC = () => {
    const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getLiveLocations();
            setVehicles(data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error("Failed to fetch tracking data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const mapMarkers = vehicles.map(v => ({
        lat: 0, lng: 0, // Simplified for mock
        label: v.registrationNumber,
        type: 'vehicle' as const
    }));

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Live Fleet Tracking</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                    <button onClick={fetchData} className="p-2 bg-white rounded shadow hover:bg-gray-100">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Main Map View */}
            <div className="mb-6">
                <MapDisplay markers={mapMarkers} height="400px" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map(v => (
                    <div key={v.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{v.registrationNumber}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${v.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {v.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin size={16} />
                            {v.latitude && v.longitude ? (
                                <span className="font-mono text-sm">{v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}</span>
                            ) : (
                                <span className="text-sm italic text-gray-400">No Signal</span>
                            )}
                        </div>

                        <div className="text-xs text-gray-400">
                            Signal: {v.lastLocationUpdate ? new Date(v.lastLocationUpdate).toLocaleString() : 'Never'}
                        </div>
                    </div>
                ))}

                {vehicles.length === 0 && !loading && (
                    <div className="col-span-full text-center py-10 text-gray-400">
                        No active vehicles found.
                    </div>
                )}
            </div>
        </div>
    );
};
