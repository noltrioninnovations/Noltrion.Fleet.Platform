import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, CheckCircle } from 'lucide-react';
import { getPendingRequests, type JobRequest } from '../../services/jobRequestService';

export const OfficeJobRequests = () => {
    const [requests, setRequests] = useState<JobRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getPendingRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    // Add navigate
    const navigate = useNavigate();

    // ...

    const handleConvert = async (req: JobRequest) => {
        // Redirect to Manifests page with prefill data
        navigate('/manifests', {
            state: {
                createFromRequest: req
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                <h1 className="text-lg font-bold text-gray-900">Pending Job Requests</h1>
                <button onClick={loadData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="animate-spin text-blue-600 mr-2" /> Loading...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">No pending requests.</div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            {new Date(req.preferredDate).toLocaleDateString()}
                                        </span>
                                        <h3 className="text-sm font-bold text-gray-900">{req.cargoDescription}</h3>
                                    </div>
                                    <div className="text-xs text-gray-500 flex gap-4">
                                        <span>From: {req.pickupLocation}</span>
                                        <ArrowRight size={12} />
                                        <span>To: {req.dropLocation}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleConvert(req)}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Convert to Manifest
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
