import React, { useState, useEffect } from 'react';
import { X, Save, Eye, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { getInvoiceByTripId, generateInvoice, updateInvoice, type Invoice, type InvoiceLine } from '../../services/invoiceService';
import { InvoicePreviewPanel } from './InvoicePreviewPanel';

interface InvoiceFormPanelProps {
    tripId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const InvoiceFormPanel: React.FC<InvoiceFormPanelProps> = ({ tripId, isOpen, onClose }) => {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);


    useEffect(() => {
        if (isOpen && tripId) {
            loadInvoice();
        }
    }, [isOpen, tripId]);

    const CHARGE_TYPES = ["Transport Charges", "Handling Charges", "Entry Charges"];

    const loadInvoice = async () => {
        setLoading(true);
        try {
            // First try to fetch existing
            let data = await getInvoiceByTripId(tripId);

            // If not found, auto-generate draft
            if (!data) {
                console.log("No existing invoice, generating draft...");
                data = await generateInvoice(tripId);
            }

            // Ensure Transport Charges exists
            if (data && !data.lines.some(l => l.description === "Transport Charges")) {
                data.lines.unshift({
                    id: crypto.randomUUID(),
                    description: "Transport Charges",
                    amount: 0,
                    taxAmount: 0,
                    invoiceId: data.id || ''
                } as any);
            }

            setInvoice(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!invoice) return;
        setLoading(true);
        try {
            await updateInvoice(invoice);
            // alert("Invoice Saved!"); // Optional: show toast or just close
            onClose();
        } catch (error) {
            console.error("Failed to save invoice", error);
            alert("Failed to save invoice. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateLineItem = (index: number, field: keyof InvoiceLine, value: any) => {
        if (!invoice) return;
        const lines = [...invoice.lines];
        lines[index] = { ...lines[index], [field]: value };

        // Recalculate totals
        const totalAmt = lines.reduce((sum, l) => sum + l.amount, 0);
        const totalTax = lines.reduce((sum, l) => sum + (l.taxAmount || l.amount * 0.09), 0);

        setInvoice({ ...invoice, lines, totalAmount: totalAmt, totalTax });
    };

    const addLineItem = () => {
        if (!invoice) return;
        const newLine: InvoiceLine = {
            id: crypto.randomUUID(), // Temp ID
            description: "Handling Charges", // Default to second option
            amount: 0,
            taxAmount: 0
        };
        const lines = [...invoice.lines, newLine];
        setInvoice({ ...invoice, lines });
    };

    const removeLineItem = (index: number) => {
        if (!invoice) return;
        const lines = invoice.lines.filter((_, i) => i !== index);

        // Recalculate
        const totalAmt = lines.reduce((sum, l) => sum + l.amount, 0);
        const totalTax = lines.reduce((sum, l) => sum + (l.taxAmount || l.amount * 0.09), 0);

        setInvoice({ ...invoice, lines, totalAmount: totalAmt, totalTax });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm flex justify-end">
                <div className="w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
                        <div>
                            <h2 className="font-bold text-lg">Invoice Details</h2>
                            <p className="text-slate-400 text-xs">{invoice?.invoiceNumber || 'Generating...'}</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <RefreshCw className="animate-spin mb-2" size={24} />
                                <span className="text-xs">Processing Charges...</span>
                            </div>
                        ) : invoice ? (
                            <div className="space-y-4">
                                {/* Summary Card */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Total Amount</span>
                                        <span className="text-2xl font-bold text-slate-900">${(invoice.totalAmount + invoice.totalTax).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                                        <span>Subtotal</span>
                                        <span>${invoice.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Tax</span>
                                        <span>${invoice.totalTax.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-700 uppercase mb-2 flex justify-between items-center">
                                        Line Items
                                        <button
                                            onClick={addLineItem}
                                            className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-slate-600 font-bold flex items-center gap-1">
                                            <Plus size={12} /> ADD ITEM
                                        </button>
                                    </h3>
                                    <div className="space-y-2">
                                        {invoice.lines.map((line, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded border border-gray-200 shadow-sm relative group">
                                                <button
                                                    onClick={() => removeLineItem(idx)}
                                                    className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={14} />
                                                </button>

                                                {/* Description Input / Dropdown */}
                                                {line.description === "Transport Charges" ? (
                                                    <div className="w-full text-sm font-bold text-slate-900 mb-1 py-1">
                                                        Transport Charges <span className="text-[10px] text-gray-400 font-normal ml-2">(Default)</span>
                                                    </div>
                                                ) : (
                                                    <select
                                                        className="w-full text-sm font-medium border-none p-0 focus:ring-0 mb-1 text-slate-800 bg-transparent pr-8"
                                                        value={line.description}
                                                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                                                    >
                                                        {CHARGE_TYPES.filter(t => t !== "Transport Charges").map(t => (
                                                            <option key={t} value={t}>{t}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">Amount (SGD)</span>
                                                    <input
                                                        type="number"
                                                        className="text-right text-sm font-bold border-gray-200 rounded p-1 w-24 focus:ring-slate-500 focus:border-slate-500"
                                                        value={line.amount}
                                                        onChange={(e) => updateLineItem(idx, 'amount', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-red-500">Failed to load invoice.</div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t border-gray-200 flex gap-3">
                        <button
                            onClick={() => setIsPreviewOpen(true)}
                            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <Eye size={16} /> Preview
                        </button>

                        {/* Status Transitions */}
                        {invoice?.status === 'Accrued' && (
                            <button
                                onClick={() => { setInvoice({ ...invoice, status: 'Invoiced' }); handleSave(); }}
                                className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Save size={16} /> Confirm Invoice
                            </button>
                        )}

                        {invoice?.status === 'Invoiced' && (
                            <button
                                onClick={() => { setInvoice({ ...invoice, status: 'PaymentReceived' }); handleSave(); }}
                                className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Save size={16} /> Receive Payment
                            </button>
                        )}

                        {invoice?.status === 'PaymentReceived' && (
                            <div className="flex-1 flex items-center justify-center text-green-600 font-bold text-sm bg-green-50 rounded-lg border border-green-200">
                                Paid in Full
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <InvoicePreviewPanel
                invoice={invoice!}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </>
    );
};
