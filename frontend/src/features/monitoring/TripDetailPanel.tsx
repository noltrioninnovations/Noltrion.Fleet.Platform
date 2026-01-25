import React from 'react';
import type { Trip } from '../../types/trip';
import { X, Navigation, User, MapPin, CheckCircle, Play, Edit, Upload, FileText, Truck } from 'lucide-react';
import { MapDisplay } from '../../components/ui/MapDisplay';
import { uploadPod } from '../../services/tripService';

interface TripDetailPanelProps {
    trip: Trip | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (id: string, status: string) => Promise<void>;
    onJobStatusChange: (jobId: string, status: string) => Promise<void>;
    onEdit: () => void;
    onBilling: () => void;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full flex flex-col bg-gray-50/50 w-full">
        {children}
    </div>
);

export const TripDetailPanel: React.FC<TripDetailPanelProps> = ({
    trip,
    isOpen,
    onClose,
    onStatusChange,
    onJobStatusChange,
    onEdit,
    onBilling
}) => {
    const [activeTab, setActiveTab] = React.useState<'overview' | 'route'>('overview');

    if (!isOpen || !trip) return null;

    const sortedJobs = [...trip.tripJobs].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center justify-center gap-2 py-2 flex-1 border-b-2 transition-colors ${activeTab === id
                ? 'border-gray-800 text-gray-900 bg-gray-50 font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-medium'
                }`}
        >
            <Icon size={14} />
            <span className="text-[10px] uppercase tracking-wider">{label}</span>
        </button>
    );

    return (
        <Wrapper>
            {/* Header */}
            <div className="bg-[#4d5761] text-white px-4 py-3 flex items-start justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                        <Navigation size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight">{trip.vehicle?.registrationNumber || 'No Vehicle'}</h1>
                        <p className="text-[10px] text-gray-300 uppercase tracking-wider font-medium">Trip • {trip.tripStatus}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={onBilling} className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded transition-colors" title="Billing & Invoicing">
                        <FileText size={16} />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Edit Manifest"
                    >
                        <Edit size={16} />
                    </button>
                    <div className="h-4 w-px bg-white/20 mx-1"></div>
                    <button onClick={onClose} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white border-b border-gray-200 shadow-sm z-0">
                <TabButton id="overview" label="Overview" icon={FileText} />
                <TabButton id="route" label="Route Map" icon={MapPin} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 p-3 space-y-3 custom-scrollbar">

                {activeTab === 'overview' && (
                    <div className="space-y-3">
                        {/* Status / Actions Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Trip Actions</h3>
                            <div className="flex gap-2 flex-wrap">
                                {/* 1. Assigned -> StartTrip */}
                                {(trip.tripStatus === 'Assigned' || trip.tripStatus === 'Planned') && (
                                    <button
                                        onClick={() => onStatusChange(trip.id, 'StartTrip')}
                                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-bold shadow-sm transition-all"
                                    >
                                        <Play size={14} /> START TRIP
                                    </button>
                                )}

                                {/* 2. StartTrip -> StartLoad */}
                                {trip.tripStatus === 'StartTrip' && (
                                    <button
                                        onClick={() => onStatusChange(trip.id, 'StartLoad')}
                                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-bold shadow-sm transition-all"
                                    >
                                        <User size={14} /> START LOAD
                                    </button>
                                )}

                                {/* 3. StartLoad -> CompleteLoad */}
                                {trip.tripStatus === 'StartLoad' && (
                                    <button
                                        onClick={() => onStatusChange(trip.id, 'CompleteLoad')}
                                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-bold shadow-sm transition-all"
                                    >
                                        <CheckCircle size={14} /> COMPLETE LOAD
                                    </button>
                                )}

                                {/* 4. CompleteLoad -> InTransit */}
                                {trip.tripStatus === 'CompleteLoad' && (
                                    <button
                                        onClick={() => onStatusChange(trip.id, 'InTransit')}
                                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs font-bold shadow-sm transition-all"
                                    >
                                        <Navigation size={14} /> START TRANSIT
                                    </button>
                                )}

                                {/* 5. InTransit -> Completed */}
                                {trip.tripStatus === 'InTransit' && (
                                    <button
                                        onClick={() => onStatusChange(trip.id, 'Completed')}
                                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold shadow-sm transition-all"
                                    >
                                        <CheckCircle size={14} /> COMPLETE TRIP
                                    </button>
                                )}

                                {trip.tripStatus === 'Completed' && (
                                    <div className="w-full text-center text-xs font-bold text-gray-500 py-2 bg-gray-100 rounded border border-gray-200">
                                        Trip Finalized
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Driver Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Driver & Vehicle</h3>
                            </div>
                            <div className="p-3">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">{trip.driver?.fullName || 'Unassigned'}</div>
                                        <div className="text-[10px] text-gray-500">Driver</div>
                                        <div className="text-[10px] text-gray-400 mt-0.5">{trip.driver?.phoneNumber || 'No Mobile'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Truck size={16} /> {/* Assuming Truck icon is imported or uses generic logic */}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900">{trip.vehicle?.registrationNumber || 'No Vehicle'}</div>
                                        <div className="text-[10px] text-gray-500">Vehicle • {trip.truckType || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* POD Section */}
                        {(trip.tripStatus === 'InTransit' || trip.tripStatus === 'Completed' || trip.tripStatus === 'Delivery') && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/30">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Proof of Delivery</h3>
                                </div>
                                <div className="p-3">
                                    {trip.proofOfDeliveryUrl ? (
                                        <a
                                            href={trip.proofOfDeliveryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold hover:bg-green-100 transition-colors"
                                        >
                                            <FileText size={14} /> View Document
                                        </a>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center gap-1 w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all group">
                                            <Upload size={16} className="text-gray-400 group-hover:text-gray-600" />
                                            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700">Upload POD</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,application/pdf"
                                                onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        try {
                                                            await uploadPod(trip.id, e.target.files[0]);
                                                            alert('POD Uploaded Successfully! Please refresh.');
                                                        } catch (err) {
                                                            alert('Failed to upload POD');
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'route' && (
                    <div className="space-y-3">
                        {/* Map Card - Taller */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <MapDisplay
                                markers={[
                                    ...sortedJobs.map((tj, i) => ({
                                        lat: 0, lng: 0,
                                        label: tj.job?.customerName,
                                        type: (i === 0 ? 'pickup' : i === sortedJobs.length - 1 ? 'delivery' : 'vehicle') as any
                                    })),
                                    { lat: 0, lng: 0, label: 'Current Location', type: 'vehicle' }
                                ]}
                                height="200px" // Slightly taller map
                                showRoute
                            />
                        </div>

                        {/* Jobs Timeline */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/30">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Route Timeline</h3>
                            </div>
                            <div className="p-3 space-y-3 relative">
                                {sortedJobs.map((tj, idx) => (
                                    <div key={tj.id} className="flex gap-3 relative z-0">
                                        {/* Connecting Line */}
                                        {idx !== sortedJobs.length - 1 && (
                                            <div className="absolute left-[11px] top-6 bottom-[-14px] w-0.5 bg-gray-200 -z-10" />
                                        )}

                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-none shadow-sm border border-white
                                            ${tj.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-white border-blue-200 text-blue-600 ring-4 ring-blue-50'} `}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <span className="text-xs font-bold text-gray-900">{tj.job?.customerName}</span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight
                                                    ${tj.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} `}>
                                                    {tj.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                                                {tj.job?.deliveryAddress}
                                            </div>

                                            {trip.tripStatus === 'InTransit' && tj.status !== 'Delivered' && (
                                                <button
                                                    onClick={() => onJobStatusChange(tj.id, 'Delivered')}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-green-600 text-green-600 rounded-full hover:bg-green-50 text-[10px] font-bold transition-colors"
                                                >
                                                    <CheckCircle size={10} /> Confirm Delivery
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Wrapper>
    );
};
