import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import type { Invoice } from '../../services/invoiceService';

interface InvoicePreviewPanelProps {
    invoice: Invoice;
    isOpen: boolean;
    onClose: () => void;
}

export const InvoicePreviewPanel: React.FC<InvoicePreviewPanelProps> = ({ invoice, isOpen, onClose }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:static print:bg-white">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl h-[90vh] flex flex-col print:h-auto print:shadow-none print:w-full">
                {/* Header (Hidden in Print) */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 print:hidden">
                    <h2 className="text-lg font-bold text-gray-800">Invoice Preview</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Printer size={16} /> Print / Save PDF
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-y-auto p-8 print:overflow-visible print:p-0" id="invoice-print-area">
                    <div className="space-y-8">
                        {/* Inv Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">INVOICE</h1>
                                <p className="text-slate-500 mt-1 uppercase tracking-wider text-sm">#{invoice.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-lg text-slate-900">Noltrion FleetX</h3>
                                <p className="text-sm text-gray-500">123 Logistics Way</p>
                                <p className="text-sm text-gray-500">Singapore 600123</p>
                                <p className="text-sm text-gray-500">registration@fleetx.com</p>
                            </div>
                        </div>

                        {/* Dates & Bill To */}
                        <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-100 py-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h4>
                                <p className="font-bold text-slate-900">MegaCorp Logistics</p> {/* TODO: Get Customer Name */}
                                <p className="text-sm text-gray-500">Tech Park, Bangalore</p>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1">
                                    <div className="flex justify-end gap-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                                        <span className="font-medium text-slate-900">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</span>
                                        <span className="font-medium text-slate-900">{new Date(new Date(invoice.invoiceDate).setDate(new Date(invoice.invoiceDate).getDate() + 30)).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="text-left py-3 text-xs font-bold text-slate-900 uppercase tracking-wider w-1/2">Description</th>
                                    <th className="text-right py-3 text-xs font-bold text-slate-900 uppercase tracking-wider">Tax</th>
                                    <th className="text-right py-3 text-xs font-bold text-slate-900 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoice.lines.map((line, idx) => (
                                    <tr key={idx}>
                                        <td className="py-4 text-sm text-slate-700 font-medium">{line.description}</td>
                                        <td className="py-4 text-sm text-gray-500 text-right">${line.taxAmount.toFixed(2)}</td>
                                        <td className="py-4 text-sm text-slate-900 font-bold text-right">${line.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end pt-4">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${invoice.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Tax (9% GST)</span>
                                    <span>${invoice.totalTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-900 pt-2">
                                    <span>Total</span>
                                    <span>${(invoice.totalAmount + invoice.totalTax).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-12 text-center text-xs text-gray-400">
                            <p>Thank you for your business.</p>
                            <p>Please make payment within 30 days.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
