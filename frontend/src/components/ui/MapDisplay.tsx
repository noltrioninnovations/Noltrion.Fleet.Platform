import React, { useState } from 'react';
import { MapPin, Navigation, Layers, Maximize2, Map as MapIcon, Video, Building2, Palmtree, Coffee } from 'lucide-react';

interface Marker {
    lat: number;
    lng: number;
    label?: string;
    type: 'pickup' | 'delivery' | 'vehicle' | 'landmark';
}

interface MapDisplayProps {
    markers?: Marker[];
    height?: string;
    className?: string;
    showRoute?: boolean;
    initialViewMode?: 'map' | 'street';
}

export const MapDisplay: React.FC<MapDisplayProps> = ({
    markers = [],
    height = '200px',
    className = '',
    showRoute = false,
    initialViewMode = 'map'
}) => {
    const [viewMode, setViewMode] = useState<'map' | 'street'>(initialViewMode);

    // Mock Singapore Locations if none provided or for background
    const singaporeLandmarks: Marker[] = [
        { lat: 1.2823, lng: 103.8584, label: 'Marina Bay Sands', type: 'landmark' },
        { lat: 1.3521, lng: 103.8198, label: 'Central Business District', type: 'landmark' },
        { lat: 1.3644, lng: 103.9915, label: 'Changi Airport', type: 'landmark' },
        { lat: 1.2816, lng: 103.8636, label: 'Gardens by the Bay', type: 'landmark' }
    ];

    const displayMarkers = markers.length > 0 ? markers : singaporeLandmarks;

    return (
        <div
            className={`relative overflow-hidden rounded-lg bg-[#e8eaed] border border-gray-200 group ${className}`}
            style={{ height }}
        >
            {/* Map View */}
            {viewMode === 'map' && (
                <>
                    {/* modern Google-like Map Background (Singapore Context) */}
                    <div className="absolute inset-0 bg-[#f8f9fa]">
                        {/* City Grid */}
                        <div className="absolute inset-0 opacity-[0.08]" style={{
                            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}></div>

                        {/* Singapore Coastline / Water (Mock) */}
                        <div className="absolute bottom-0 left-0 w-full h-24 bg-blue-100 opacity-40 blur-2xl -rotate-1"></div>
                        <div className="absolute top-1/2 right-0 w-32 h-64 bg-blue-100 opacity-30 blur-3xl rotate-12"></div>

                        {/* Parks (Jewel, Gardens, etc) */}
                        <div className="absolute top-10 right-20 w-32 h-24 bg-[#e6f4ea] rounded-full blur-xl opacity-60"></div>
                        <div className="absolute top-1/2 left-1/4 w-48 h-32 bg-[#e6f4ea] rounded-full blur-2xl opacity-50"></div>

                        {/* Major Expressways (PIE, ECP) - Mock */}
                        <div className="absolute top-1/4 left-0 w-full h-[8px] bg-[#fff] border-y border-gray-200/50 shadow-sm rotate-2"></div>
                        <div className="absolute bottom-1/3 left-0 w-full h-[6px] bg-[#fff] border-y border-gray-200/50 shadow-sm -rotate-3"></div>
                    </div>

                    {/* Route Line (Mock) */}
                    {showRoute && markers.length >= 2 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <path
                                d="M 100 250 Q 250 100 400 250 T 700 150"
                                fill="none"
                                stroke="#4285f4"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="opacity-80"
                            />
                            <path
                                d="M 100 250 Q 250 100 400 250 T 700 150"
                                fill="none"
                                stroke="#1a73e8"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="1 10"
                                className="animate-[dash_2s_linear_infinite]"
                            />
                        </svg>
                    )}
                </>
            )}

            {/* Street View Mode (Singapore) */}
            {viewMode === 'street' && (
                <div className="absolute inset-0 bg-black">
                    <img
                        src="/assets/singapore_street_view.png"
                        alt="Singapore Street View"
                        className="w-full h-full object-cover opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>

                    {/* Compass / Navigation Overlay */}
                    <div className="absolute bottom-4 left-4 flex flex-col items-center">
                        <div className="mb-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-white font-bold border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
                            <Palmtree size={10} className="text-green-400" /> Singapore Downtown
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                            <Navigation size={18} />
                        </div>
                    </div>
                </div>
            )}

            {/* Render Markers (Only in Map View) */}
            {viewMode === 'map' && (
                displayMarkers.map((marker, idx) => {
                    const left = `${10 + (idx * 22) % 80}%`;
                    const top = `${20 + (idx * 18) % 60}%`;

                    return (
                        <div
                            key={idx}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-10 ${marker.type === 'landmark' ? 'opacity-70 group-hover:opacity-100' : ''}`}
                            style={{ left, top }}
                        >
                            <div className="flex flex-col items-center group/marker">
                                {marker.label && (
                                    <div className={`mb-1 px-2 py-0.5 bg-white shadow-md border rounded text-[10px] font-bold text-gray-800 whitespace-nowrap scale-90 group-hover/marker:scale-100 transition-transform ${marker.type === 'landmark' ? 'border-orange-100 bg-orange-50/50' : 'border-gray-100'
                                        }`}>
                                        {marker.label}
                                    </div>
                                )}
                                <div className={`p-1.5 rounded-full shadow-lg border-2 border-white transform transition-transform hover:scale-110 ${marker.type === 'pickup' ? 'bg-[#34a853]' :
                                        marker.type === 'delivery' ? 'bg-[#ea4335]' :
                                            marker.type === 'vehicle' ? 'bg-[#4285f4]' : 'bg-[#fbbc05]'
                                    }`}>
                                    {marker.type === 'vehicle' ? (
                                        <Navigation size={14} className="text-white rotate-45" />
                                    ) : marker.type === 'landmark' ? (
                                        <Building2 size={12} className="text-white" />
                                    ) : (
                                        <MapPin size={14} className="text-white fill-current" />
                                    )}
                                </div>
                                <div className="w-1 h-1 bg-black/10 rounded-full mt-1 blur-[1px]"></div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Controls Overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-sm rounded shadow-md border border-gray-100 p-1 flex flex-col gap-1">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'map' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Map View"
                    >
                        <MapIcon size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('street')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'street' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Street View"
                    >
                        <Video size={16} />
                    </button>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded shadow-md border border-gray-100 p-1 flex flex-col gap-1 z-20">
                    <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Layers"><Layers size={16} /></button>
                    <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Full Screen"><Maximize2 size={16} /></button>
                </div>
            </div>

            {/* Singapore Context Badge */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <div className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-bold shadow-sm flex items-center gap-1">
                    <Coffee size={10} /> SINGAPORE FLEET
                </div>
                <div className="bg-white/40 backdrop-blur-[2px] px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-600 pointer-events-none flex items-center gap-1">
                    <span className="text-blue-600">G</span>
                    <span className="text-red-500">o</span>
                    <span className="text-yellow-500">o</span>
                    <span className="text-blue-600">g</span>
                    <span className="text-green-500">l</span>
                    <span className="text-red-500">e</span>
                    <span className="ml-1 opacity-60">Singapore Engine</span>
                </div>
            </div>

            <style>{`
                @keyframes dash {
                    to { stroke-dashoffset: -20; }
                }
            `}</style>
        </div>
    );
};
