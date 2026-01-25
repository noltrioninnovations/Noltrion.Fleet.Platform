import React, { useEffect, useState } from 'react';
import { getDeliveredJobs, approvePod } from '../../services/jobService';
import type { Job } from '../../types/planning';

export const PodApproval: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [actioning, setActioning] = useState<string | null>(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await getDeliveredJobs();
            setJobs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleApprove = async (id: string) => {
        setActioning(id);
        try {
            await approvePod(id);
            await fetchJobs(); // Refresh
        } catch (error) {
            alert('Failed to approve POD');
        } finally {
            setActioning(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">POD Approval Queue</h1>

            {loading && <p>Loading...</p>}

            <div className="grid gap-4">
                {jobs.length === 0 && !loading && <p className="text-gray-500">No jobs waiting for approval.</p>}

                {jobs.map(job => (
                    <div key={job.id} className="bg-white p-4 rounded shadow border border-gray-200 flex justify-between items-center">
                        <div>
                            <div className="font-bold text-lg">{job.customerName}</div>
                            <div className="text-sm text-gray-500">{job.deliveryAddress}</div>
                            <div className="text-xs font-mono text-gray-400 mt-1">ID: {job.id}</div>
                            {/* Placeholder for Image Link */}
                            <div className="mt-2 text-blue-600 text-sm cursor-pointer hover:underline">View Proof of Delivery</div>
                        </div>
                        <div>
                            <button
                                onClick={() => handleApprove(job.id)}
                                disabled={actioning === job.id}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {actioning === job.id ? 'Verifying...' : 'Approve POD'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
