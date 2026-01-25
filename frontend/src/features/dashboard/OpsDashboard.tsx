import { useEffect, useState } from 'react';
import { AlertCircle, Clock, MapPin, Truck } from 'lucide-react';
import { getTrips } from '../../services/tripService';
import type { Trip } from '../../types/trip';

export const OpsDashboard = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getTrips();
            setTrips(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const inProgressTrips = trips.filter(t => t.tripStatus === 'InProgress');
    const delayedTrips = trips.filter(t => t.tripStatus === 'InProgress' && t.endTime && new Date(t.endTime) < new Date()); // Mock delay logic

    if (loading) return <div className="p-8 text-center text-sm text-gray-500">Loading Operations Center...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-md font-bold text-gray-800">Operations Control</h2>
                <p className="text-xs text-gray-500">Real-time fleet monitoring and dispatch</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-red-600 uppercase">Critical Alerts</p>
                        <h3 className="text-2xl font-bold text-red-800 mt-1">{delayedTrips.length}</h3>
                        <p className="text-xs text-red-500 mt-1">Delayed Trips</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-full text-red-600"><AlertCircle size={20} /></div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase">Live Trips</p>
                        <h3 className="text-2xl font-bold text-blue-800 mt-1">{inProgressTrips.length}</h3>
                        <p className="text-xs text-blue-500 mt-1">Currently Active</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Truck size={20} /></div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase">On Time</p>
                        <h3 className="text-2xl font-bold text-emerald-800 mt-1">98%</h3>
                        <p className="text-xs text-emerald-500 mt-1">Performance</p>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600"><Clock size={20} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700">Live Manifest</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {inProgressTrips.length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-400">No active trips right now.</div>
                        ) : (
                            inProgressTrips.map(trip => (
                                <div key={trip.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded text-gray-500"><Truck size={16} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{trip.vehicle?.registrationNumber || 'Unknown Vehicle'}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                <MapPin size={10} />
                                                <span>{trip.pickupLocation || 'Depot'}</span>
                                                <span>→</span>
                                                <span>{trip.dropLocation || 'Customer'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">In Progress</span>
                                        <p className="text-xs text-gray-400 mt-1">{trip.driver?.fullName}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">Driver Availability</h3>
                    <div className="text-xs text-gray-400 text-center py-8 bg-gray-50 rounded border border-dashed border-gray-200">
                        Availability Widget Placeholder
                        <br />
                        (Requires Driver Status API)
                    </div>
                </div>
            </div>
        </div>
    );
};
