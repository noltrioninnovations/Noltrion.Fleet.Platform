import React, { type ReactNode } from 'react';
import { MapDisplay } from '../ui/MapDisplay';

interface MasterDetailLayoutProps {
    sidebarContent: ReactNode;
    detailContent: ReactNode;
    isPanelOpen: boolean;
    secondaryContent?: ReactNode;
    isSecondaryOpen?: boolean;
    panelWidth?: string;
    backgroundMarkers?: any[]; // Allow optional markers for the background map
}

export const MasterDetailLayout: React.FC<MasterDetailLayoutProps> = ({
    sidebarContent,
    detailContent,
    isPanelOpen,
    panelWidth = '400px', // Default width
    secondaryContent,
    isSecondaryOpen,
    backgroundMarkers = []
}) => {
    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-100 relative">
            {/* Sidebar List - Compact Width */}
            <div className="w-[300px] flex-none border-r border-gray-200 bg-white flex flex-col z-20 shadow-[2px_0_10px_rgba(0,0,0,0.05)]">
                <div className="flex-1 overflow-hidden relative">
                    {sidebarContent}
                </div>
            </div>

            {/* Main Content Area (Map Background) */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden">
                {/* Real Map Background */}
                <div className="absolute inset-0">
                    <MapDisplay
                        height="100%"
                        markers={backgroundMarkers.length > 0 ? backgroundMarkers : [
                            { lat: 0, lng: 0, label: 'Central Hub', type: 'vehicle' }
                        ]}
                    />
                </div>

                {/* Detail Panel - Level 1 */}
                {isPanelOpen && (
                    <div
                        className="absolute top-0 left-0 bottom-0 bg-white shadow-xl z-30 overflow-hidden flex flex-col animate-in slide-in-from-left-4 fade-in duration-200 border-r border-gray-200"
                        style={{ width: panelWidth }}
                    >
                        {detailContent}
                    </div>
                )}

                {/* Secondary/Edit Panel - Level 2 (Stacked to the right) */}
                {isSecondaryOpen && (
                    <div
                        className="absolute top-0 max-h-full bg-white shadow-2xl z-40 overflow-hidden flex flex-col animate-in slide-in-from-left-4 fade-in duration-200 border-r border-gray-200"
                        style={{ width: panelWidth, left: panelWidth }}
                    >
                        {secondaryContent}
                    </div>
                )}
            </div>
        </div>
    );
};
