
import React, { useState } from 'react';
import type { JobRequest } from '../../services/jobRequestService';
import { X, Package, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { MapDisplay } from '../../components/ui/MapDisplay';

interface JobRequestDetailPanelProps {
    request: JobRequest | null;
    isOpen: boolean;
    onClose: () => void;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="h-full flex flex-col bg-gray-50/50 w-full">
        {children}
    </div>
);

type Tab = 'overview';

export const JobRequestDetailPanel: React.FC<JobRequestDetailPanelProps> = ({
    request,
    isOpen,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    if (!isOpen || !request) return null;

    const TabButton = ({ id, label }: { id: Tab, label: string }) => (
        <div
            onClick={() => setActiveTab(id)}
            className={`px-3 py-2 border-b-2 text-[11px] cursor-pointer transition-colors ${activeTab === id
                ? 'border-white text-white font-medium'
                : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5'
                }`}
        >
            {label}
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'bg-blue-500';
            case 'Converted': return 'bg-green-500';
            case 'Rejected': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <Wrapper>
            {/* Header */}
            <div className="bg-[#4d5761] text-white px-3 py-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                        <Package size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-tight line-clamp-1">{request.cargoDescription || 'New Request'}</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(request.requestStatus)}`} />
                            <p className="text-[10px] text-gray-300 uppercase tracking-wider">{request.requestStatus}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-4 w-px bg-white/20"></div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Quick Actions / Tabs */}
            <div className="bg-[#4d5761] text-gray-300 flex px-2 border-t border-white/10">
                <TabButton id="overview" label="Overview" />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar relative">

                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                    <>
                        {/* Status Card */}
                        {request.tripId && (
                            <div className="bg-green-50 rounded border border-green-200 p-3 flex items-start gap-3">
                                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                                <div>
                                    <div className="text-xs font-bold text-green-800">Request Accepted</div>
                                    <div className="text-[11px] text-green-700 mt-1">
                                        This request has been converted to Manifest <strong>#{request.tripId.substring(0, 8)}</strong>.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Map Card */}
                        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Route Map</h3>
                                <MapPin size={12} className="text-gray-400" />
                            </div>
                            <MapDisplay
                                markers={[
                                    { lat: 0, lng: 0, label: 'Pickup', type: 'pickup' },
                                    { lat: 0, lng: 0, label: 'Drop', type: 'delivery' }
                                ]}
                                height="150px"
                            />
                            <div className="p-3 space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Pickup From</div>
                                        <div className="text-xs text-gray-700 font-medium leading-tight">{request.pickupLocation}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Drop To</div>
                                        <div className="text-xs text-gray-700 font-medium leading-tight">{request.dropLocation}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded shadow-sm border border-gray-200">
                            <div className="px-3 py-1.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Details</h3>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Preferred Date</div>
                                    <div className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                                        <Calendar size={12} className="text-gray-400" />
                                        {new Date(request.preferredDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Volume</div>
                                    <div className="text-xs font-medium text-gray-800">{request.volume} m³</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Weight</div>
                                    <div className="text-xs font-medium text-gray-800">{request.weight} kg</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 mb-0.5">Created On</div>
                                    <div className="text-xs font-medium text-gray-800">{new Date(request.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                    </>
                )}
            </div>
        </Wrapper>
    );
};
