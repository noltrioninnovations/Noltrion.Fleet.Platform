import { useState, useEffect } from 'react';
import { getTrips } from '../../services/tripService';
import type { Trip } from '../../types/trip';
import { RefreshCw, Search, Download } from 'lucide-react';

export const TripManagement = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        setLoading(true);
        try {
            const data = await getTrips();
            setTrips(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Define CSV Headers
        const headers = ['Trip Number', 'Status', 'Date', 'Customer', 'Vehicle', 'Driver', 'Pickup', 'Drop', 'Jobs', 'Weight (Kg)'];

        // Map Data to CSV Rows
        const rows = trips.map(t => [
            t.tripNumber || '',
            t.tripStatus || '',
            t.tripDate ? new Date(t.tripDate).toLocaleDateString() : '',
            t.tripJobs?.[0]?.job?.customerName || '-',
            t.vehicle?.registrationNumber || '',
            t.driver?.fullName || '',
            t.pickupLocation || '',
            t.dropLocation || '',
            t.tripJobs?.length || 0,
            // @ts-ignore - weightKg exists on job at runtime
            t.tripJobs?.reduce((sum, j) => sum + (j.job?.weightKg || 0), 0) || 0
        ]);

        // Construct CSV Content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download Blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'JobManagement_Export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const filteredTrips = trips.filter(t =>
        t.tripNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.vehicle?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tripJobs?.[0]?.job?.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'InTransit': return 'bg-indigo-100 text-indigo-700';
            case 'CompleteLoad': return 'bg-orange-100 text-orange-700';
            case 'StartLoad': return 'bg-orange-50 text-orange-600';
            case 'StartTrip': return 'bg-blue-100 text-blue-700';
            case 'Assigned': return 'bg-blue-50 text-blue-600';
            case 'Planned': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 p-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Job Management</h1>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">{filteredTrips.length} Records</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-7 pr-3 py-1 border border-gray-300 rounded text-xs focus:ring-slate-900 focus:border-slate-900 w-48"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={loadTrips}
                        className="bg-white border border-gray-300 text-slate-700 px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                        title="Refresh Data"
                    >
                        <RefreshCw size={12} /> Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-1 text-xs font-medium"
                        title="Export to Excel"
                    >
                        <Download size={12} /> Export
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white border rounded-sm shadow-sm border-gray-300 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-300">
                            <tr>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Trip #</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Status</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Date</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Customer</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Vehicle</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Driver</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Route</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 text-right">Inv Amt</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 text-center">Inv Status</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 text-right">Jobs</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-right">Weight</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={11} className="p-4 text-center text-xs text-gray-500">Loading data...</td>
                                </tr>
                            ) : filteredTrips.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="p-4 text-center text-xs text-gray-500">No records found.</td>
                                </tr>
                            ) : (
                                filteredTrips.map((trip, idx) => (
                                    <tr key={trip.id} className={`hover:bg-blue-50 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <td className="px-3 py-1.5 text-xs font-bold text-slate-800 whitespace-nowrap border-r border-gray-100">
                                            {trip.tripNumber || 'Pending'}
                                        </td>
                                        <td className="px-3 py-1.5 border-r border-gray-100">
                                            <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold uppercase border ${getStatusColor(trip.tripStatus).replace('text-', 'border-').replace('100', '200')} ${getStatusColor(trip.tripStatus)}`}>
                                                {trip.tripStatus}
                                            </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-600 whitespace-nowrap border-r border-gray-100">
                                            {trip.tripDate ? new Date(trip.tripDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-800 font-medium border-r border-gray-100 truncate max-w-[150px]" title={trip.tripJobs?.[0]?.job?.customerName}>
                                            {trip.tripJobs?.[0]?.job?.customerName || '-'}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-700 font-mono border-r border-gray-100">
                                            {trip.vehicle?.registrationNumber || '-'}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-700 border-r border-gray-100">
                                            {trip.driver?.fullName || '-'}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-500 max-w-[200px] truncate border-r border-gray-100" title={`${trip.pickupLocation} -> ${trip.dropLocation}`}>
                                            <span className="font-semibold text-gray-700">{trip.pickupLocation?.split(',')[0]}</span>
                                            <span className="mx-1">→</span>
                                            <span>{trip.dropLocation?.split(',')[0]}</span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-slate-900 text-right font-mono border-r border-gray-100 font-bold">
                                            {trip.invoices?.[0] ? `$${trip.invoices[0].totalAmount.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-center border-r border-gray-100">
                                            {trip.invoices?.[0] ? (
                                                <span className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase border ${trip.invoices[0].status === 'PaymentReceived' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    trip.invoices[0].status === 'Invoiced' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                                    }`}>
                                                    {trip.invoices[0].status === 'PaymentReceived' ? 'Paid' : trip.invoices[0].status}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right font-mono border-r border-gray-100">
                                            {trip.tripJobs?.length || 0}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-700 text-right font-mono">
                                            {/* @ts-ignore - Runtime property check */}
                                            {trip.tripJobs?.reduce((sum, j) => sum + (j.job?.weightKg || 0), 0) || 0} kg
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer / Pagination Placeholder */}
                <div className="bg-gray-100 px-3 py-1 border-t border-gray-300 text-[11px] text-gray-600 flex justify-between items-center h-8">
                    <span className="font-medium">Total Records: {filteredTrips.length}</span>
                    <span>Excel Export Available</span>
                </div>
            </div>
        </div>
    );
};
