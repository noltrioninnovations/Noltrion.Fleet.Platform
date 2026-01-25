import React, { useEffect, useState } from 'react';
import { getInvoices, updateInvoiceStatus } from '../../services/invoiceService';
import type { Invoice } from '../../services/invoiceService';
import { RefreshCw, Search, FileText, Check, Ban, DollarSign } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const Invoices: React.FC = () => {
    const { success, error: showError } = useToast();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setIsLoading(true);
        try {
            const data = await getInvoices();
            setInvoices(data);
        } catch (err) {
            showError("Failed to load invoices");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updateInvoiceStatus(id, status);
            success(`Invoice marked as ${status}`);
            loadInvoices();
        } catch (error) {
            showError("Failed to update status");
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PaymentReceived': return 'bg-green-100 text-green-700 border-green-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Invoiced': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Draft
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 p-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Invoices</h1>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">{filteredInvoices.length} Records</span>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input
                            type="text"
                            placeholder="Search invoice #..."
                            className="pl-7 pr-3 py-1 border border-gray-300 rounded text-xs focus:ring-slate-900 focus:border-slate-900 w-48"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={loadInvoices}
                        className="bg-white border border-gray-300 text-slate-700 px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1 text-xs font-medium"
                        title="Refresh Data"
                    >
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="bg-white border rounded-sm shadow-sm border-gray-300 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm border-b border-gray-300">
                            <tr>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Invoice #</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Date</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200">Status</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 text-right">Total</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-r border-gray-200 text-right">Tax</th>
                                <th className="px-3 py-2 text-[11px] font-bold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-xs text-gray-500">Loading data...</td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-xs text-gray-500">No invoices found.</td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv, idx) => (
                                    <tr key={inv.id} className={`hover:bg-blue-50 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <td className="px-3 py-1.5 text-xs font-bold text-slate-800 whitespace-nowrap border-r border-gray-100 flex items-center gap-2">
                                            <FileText size={12} className="text-gray-400" />
                                            {inv.invoiceNumber}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-600 border-r border-gray-100">
                                            {new Date(inv.invoiceDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-1.5 border-r border-gray-100">
                                            <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold uppercase border ${getStatusColor(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-slate-900 text-right font-mono border-r border-gray-100 font-bold">
                                            ${inv.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-1.5 text-xs text-gray-500 text-right font-mono border-r border-gray-100">
                                            ${inv.totalTax.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-1.5 text-center flex justify-center gap-2">
                                            {inv.status === 'Draft' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(inv.id, 'Approved')}
                                                    className="text-green-600 hover:text-green-800 text-[10px] uppercase font-bold flex items-center"
                                                    title="Approve"
                                                >
                                                    <Check size={14} className="mr-1" /> Approve
                                                </button>
                                            )}
                                            {inv.status === 'Approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(inv.id, 'PaymentReceived')}
                                                    className="text-blue-600 hover:text-blue-800 text-[10px] uppercase font-bold flex items-center"
                                                    title="Mark Paid"
                                                >
                                                    <DollarSign size={14} className="mr-1" /> Pay
                                                </button>
                                            )}
                                            {inv.status !== 'Cancelled' && inv.status !== 'PaymentReceived' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(inv.id, 'Cancelled')}
                                                    className="text-red-400 hover:text-red-600 text-[10px] uppercase font-bold flex items-center"
                                                    title="Cancel"
                                                >
                                                    <Ban size={14} className="mr-1" /> Void
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
