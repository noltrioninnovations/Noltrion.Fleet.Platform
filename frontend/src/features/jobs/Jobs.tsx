import React, { useEffect, useState } from 'react';
import { getJobs, createJob, updateJob, cancelJob } from '../../services/jobService';
import type { Job } from '../../services/jobService';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { JobDetailPanel } from './JobDetailPanel';
import { Package, Search, Plus, RefreshCw, MapPin } from 'lucide-react';

export const Jobs: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadJobs = async () => {
        setLoading(true);
        const data = await getJobs();
        setJobs(data);
        setLoading(false);

        // Refresh selected job if open
        if (selectedJob && isPanelOpen) {
            const updated = data.find(j => j.id === selectedJob.id);
            if (updated) setSelectedJob(updated);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleCreateNew = () => {
        setSelectedJob(null);
        setIsPanelOpen(true);
    };

    const handleSave = async (jobData: Partial<Job>) => {
        setIsSubmitting(true);
        try {
            if (selectedJob) {
                await updateJob(selectedJob.id, jobData);
            } else {
                await createJob(jobData);
            }
            await loadJobs();
            setIsPanelOpen(false);
            setSelectedJob(null);
        } catch (error) {
            console.error("Failed to save", error);
            alert("Error saving job");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this job?")) return;
        try {
            await cancelJob(id);
            await loadJobs();
            setIsPanelOpen(false);
            setSelectedJob(null);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.emailReference?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sidebarContent = (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Sidebar Header */}
            <div className="p-3 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Jobs ({filteredJobs.length})</h2>
                    <div className="flex gap-1">
                        <button onClick={() => loadJobs()} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Refresh">
                            <RefreshCw size={14} />
                        </button>
                        <button onClick={handleCreateNew} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm" title="New Job">
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
                ) : filteredJobs.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 flex flex-col items-center">
                        <Search size={24} className="mb-2 opacity-20" />
                        <p>No jobs found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => { setSelectedJob(job); setIsPanelOpen(true); }}
                                className={`
                                    flex items-start p-2 cursor-pointer transition-colors group relative
                                    ${selectedJob?.id === job.id && isPanelOpen ? 'bg-[#fcf8e3]' : 'hover:bg-gray-50'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-xs text-gray-800 flex items-center gap-1.5 truncate">
                                        <Package size={12} className="text-gray-400 flex-none" />
                                        <span className="truncate">{job.customerName}</span>
                                    </div>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap ml-2
                                        ${job.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                                            job.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-50 text-blue-700'}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex items-start gap-1 text-[10px] text-gray-500 pl-4 mb-0.5">
                                    <MapPin size={10} className="mt-0.5 flex-none" />
                                    <span className="truncate">{job.deliveryAddress}</span>
                                </div>
                                <div className="text-[10px] text-gray-400 pl-4 flex gap-2">
                                    <span>{job.weightKg} kg</span>
                                    <span>•</span>
                                    <span>{job.requiredVehicleType}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );



    return (
        <MasterDetailLayout
            sidebarContent={sidebarContent}
            detailContent={
                <JobDetailPanel
                    job={selectedJob}
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    isSubmitting={isSubmitting}
                />
            }
            isPanelOpen={isPanelOpen}
        />
    );
};
