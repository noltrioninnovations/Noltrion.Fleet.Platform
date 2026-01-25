import React from 'react';
import type { Trip } from '../../types/trip';
import { Package, Truck } from 'lucide-react';

interface TripCardProps {
    trip: Trip;
    isSelected: boolean;
    onClick: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, isSelected, onClick }) => {
    // Helper to format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return '--.--.--';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    // Helper to get location city/state
    const getLocationName = (fullAddress?: string) => {
        if (!fullAddress) return 'Unknown';
        const parts = fullAddress.split(',');
        return parts[0].trim(); // First part usually city
    };

    return (
        <div
            onClick={onClick}
            className={`
                relative p-4 rounded-2xl border transition-all cursor-pointer select-none group
                ${isSelected
                    ? 'bg-white border-blue-500 ring-1 ring-blue-500 shadow-md'
                    : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                }
            `}
        >
            {/* Header: ID, Carrier, Badge */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700">
                        <Package size={20} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">#{trip.tripNumber}</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Carrier Info (Mock/Placeholder if data missing, or use Driver Name) */}
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-gray-50 border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-medium">Carrier:</span>
                        <span className="text-[10px] font-bold text-gray-700">{trip.driver?.fullName || 'Unassigned'}</span>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase
                        ${trip.tripStatus === 'InTransit' ? 'bg-blue-100 text-blue-600' :
                            trip.tripStatus === 'Completed' ? 'bg-green-100 text-green-600' :
                                trip.tripStatus === 'Delivery' ? 'bg-orange-100 text-orange-600' :
                                    'bg-gray-100 text-gray-500'
                        }
                    `}>
                        {trip.tripStatus}
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between mb-2">
                {/* Start */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-bold text-slate-800">{getLocationName(trip.pickupLocation)}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{formatDate(trip.startTime || trip.tripDate)}</span>
                </div>

                {/* Line & Truck */}
                <div className="flex-1 mx-4 relative flex items-center">
                    <div className="w-full h-px bg-gray-300 relative">
                        {/* Dots */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    </div>
                    {/* Truck Icon moving on line based on progress? For now centered or based on status */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                        <Truck size={14} className="text-slate-800" />
                    </div>
                </div>

                {/* End */}
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-slate-800">{getLocationName(trip.dropLocation)}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{formatDate(trip.endTime)}</span>
                </div>
            </div>

        </div>
    );
};
