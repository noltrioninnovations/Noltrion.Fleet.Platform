import React, { useState, useEffect } from 'react';
import type { Trip } from '../../types/trip';
import { getInvoiceByTripId, generateInvoice, updateInvoiceStatus } from '../../services/invoiceService';
import type { Invoice } from '../../services/invoiceService';
import { X, FileText, Check, RefreshCw, DollarSign, Send } from 'lucide-react';

interface BillingPanelProps {
    trip: Trip | null;
    isOpen: boolean;
    onClose: () => void;
}

export const BillingPanel: React.FC<BillingPanelProps> = ({ trip, isOpen, onClose }) => {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && trip) {
            loadInvoice();
        } else {
            setInvoice(null);
            setError(null);
        }
    }, [isOpen, trip]);

    const loadInvoice = async () => {
        if (!trip) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getInvoiceByTripId(trip.id);
            setInvoice(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load invoice");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!trip) return;
        setGenerating(true);
        setError(null);
        try {
            const newInvoice = await generateInvoice(trip.id);
            setInvoice(newInvoice);
        } catch (err) {
            console.error(err);
            setError("Failed to generate invoice. Ensure trip is valid.");
        } finally {
            setGenerating(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (!invoice) return;
        setLoading(true);
        try {
            await updateInvoiceStatus(invoice.id, status);
            setInvoice({ ...invoice, status: status as 'Cancelled' | 'Accrued' | 'Invoiced' | 'PaymentReceived' | 'Draft' | 'Approved' });
        } catch (err) {
            setError("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !trip) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl flex flex-col w-auto min-w-[500px] max-w-[90vw] max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#4d5761] text-white px-4 py-3 flex justify-between items-center shadow-md z-10 flex-none">
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-yellow-400" />
                        <div>
                            <h2 className="font-bold text-base">Billing & Invoicing</h2>
                            <p className="text-[10px] text-gray-300">Trip: {trip.vehicle?.registrationNumber || 'Unknown'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    {loading && !invoice ? (
                        <div className="flex justify-center items-center h-40 text-gray-400 gap-2">
                            <RefreshCw className="animate-spin" size={16} /> Loading...
                        </div>
                    ) : !invoice ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                <FileText size={32} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-700">No Invoice Generated</h3>
                                <p className="text-xs text-gray-500 max-w-[200px] mt-1 mx-auto">Generate an invoice based on trip details and manifest items.</p>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2"
                            >
                                {generating ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                                {generating ? 'Generating...' : 'Generate Invoice'}
                            </button>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Status Card */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full inline-block mt-1
                                    ${invoice.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            invoice.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {invoice.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Invoice #</p>
                                    <p className="text-sm font-mono font-bold text-gray-800">{invoice.invoiceNumber}</p>
                                </div>
                            </div>

                            {/* Invoice Table */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                    <h3 className="text-xs font-bold text-gray-600 uppercase">Charges Details</h3>
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-[10px] uppercase w-2/3">Item</th>
                                            <th className="px-4 py-2 text-right font-medium text-[10px] uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {invoice.lines.map((line) => (
                                            <tr key={line.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2 text-gray-700 text-xs whitespace-normal">{line.description}</td>
                                                <td className="px-4 py-2 text-right text-gray-800 font-mono text-xs">S${line.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                                        <tr>
                                            <td className="px-4 py-2 text-right text-xs text-gray-600">Subtotal</td>
                                            <td className="px-4 py-2 text-right font-mono text-xs">S${invoice.totalAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 text-right text-xs text-gray-600">Tax (9%)</td>
                                            <td className="px-4 py-2 text-right font-mono text-xs">S${invoice.totalTax.toFixed(2)}</td>
                                        </tr>
                                        <tr className="bg-blue-50/50 text-blue-900 border-t border-blue-100">
                                            <td className="px-4 py-3 text-right text-sm">TOTAL</td>
                                            <td className="px-4 py-3 text-right font-mono text-base">S${(invoice.totalAmount + invoice.totalTax).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Actions */}
                            {invoice.status === 'Draft' && (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={() => handleStatusUpdate('Approved')}
                                        className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded font-semibold text-xs hover:bg-green-700 shadow-sm"
                                    >
                                        <Check size={14} /> Approve Invoice
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('Void')}
                                        className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-2 rounded font-semibold text-xs hover:bg-red-100"
                                    >
                                        <X size={14} /> Void
                                    </button>
                                </div>
                            )}
                            {invoice.status === 'Approved' && (
                                <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded font-bold text-xs hover:bg-slate-800 shadow-sm">
                                    <Send size={14} /> Send to Customer
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 text-center p-2 border-t border-gray-200 flex-none">
                    <p className="text-[10px] text-gray-400">Billing Source: System • {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
