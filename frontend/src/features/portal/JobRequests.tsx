import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Calendar, Package, Search, Filter, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { getMyRequests, type JobRequest } from '../../services/jobRequestService';
import { JobRequestPanel } from './JobRequestPanel';
import { JobRequestDetailPanel } from './JobRequestDetailPanel';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { useToast } from '../../contexts/ToastContext';

export const JobRequests = () => {
    const [requests, setRequests] = useState<JobRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getMyRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
            showError("Failed to load requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setIsCreating(true);
        setSelectedId(null);
        setIsPanelOpen(true);
    };

    const handleRowClick = (id: string) => {
        setSelectedId(id);
        setIsCreating(false);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setIsCreating(false);
    };

    const handleSave = () => {
        loadData();
        success("Request submitted successfully");
        setIsCreating(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Submitted': return <Clock size={14} />;
            case 'Converted': return <CheckCircle size={14} />;
            case 'Rejected': return <AlertCircle size={14} />;
            default: return <XCircle size={14} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Converted': return 'text-green-600 bg-green-50 border-green-200';
            case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white">
            {/* Header / Tabs */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Job Requests ({requests.length})</span>
                <div className="ml-auto flex gap-2">
                    <button onClick={loadData} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={handleCreateNew} className="p-1 hover:bg-gray-100 rounded text-blue-600">
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                        <span className="text-xs">Loading requests...</span>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">
                        No requests found. Click + to create one.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {requests.map((req) => {
                            const isSelected = selectedId === req.id;
                            const statusColor = req.requestStatus === 'Converted' ? 'bg-green-500' :
                                req.requestStatus === 'Rejected' ? 'bg-red-500' : 'bg-blue-500';

                            return (
                                <div
                                    key={req.id}
                                    onClick={() => handleRowClick(req.id)}
                                    className={`
                                        flex items-start p-3 cursor-pointer transition-colors group relative
                                        ${isSelected ? 'bg-[#fcf8e3]' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    {/* Left: Icon with Status Dot */}
                                    <div className="relative mr-3 mt-0.5">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                                            <Package size={16} />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${statusColor}`}></div>
                                    </div>

                                    {/* Middle: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {req.cargoDescription || 'Untitled Request'}
                                            </h4>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                <Calendar size={10} />
                                                <span>{new Date(req.preferredDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex text-[10px] text-gray-500 gap-2 mb-1">
                                            <span className="truncate">{req.pickupLocation?.split(',')[0]}</span>
                                            <span className="text-gray-300">→</span>
                                            <span className="truncate">{req.dropLocation?.split(',')[0]}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(req.requestStatus)}`}>
                                                {getStatusIcon(req.requestStatus)} {req.requestStatus}
                                            </span>
                                        </div>
                                    </div>

                                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500"></div>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    const helperMarkers = requests.map(r => ({
        lat: 0, lng: 0,
        label: r.cargoDescription || 'Job',
        type: 'job' as const
    }));

    return (
        <MasterDetailLayout
            sidebarContent={sidebarContent}
            detailContent={
                isCreating ? (
                    <JobRequestPanel
                        isOpen={true}
                        onClose={handleClosePanel}
                        onSave={handleSave}
                    />
                ) : (
                    <JobRequestDetailPanel
                        isOpen={isPanelOpen}
                        onClose={handleClosePanel}
                        request={requests.find(r => r.id === selectedId) || null}
                    />
                )
            }
            isPanelOpen={isPanelOpen}
            backgroundMarkers={helperMarkers}
        />
    );
};
