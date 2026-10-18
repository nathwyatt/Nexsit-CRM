import { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DocumentPanel from '@/Components/Document/DocumentPanel';
import { useCurrency, rentSuffix } from '@/Utils/format';

const STATUS_COLORS = {
    pending:    'bg-amber-100 text-amber-700',
    active:     'bg-green-100 text-green-700',
    expired:    'bg-gray-100 text-gray-600',
    terminated: 'bg-red-100 text-red-700',
};

const PAY_STATUS_COLORS = {
    pending:   'bg-amber-100 text-amber-700',
    paid:      'bg-green-100 text-green-700',
    overdue:   'bg-red-100 text-red-700',
    partial:   'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-500',
};

const FREQ_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };
const METHOD_LABELS = { bank_transfer: 'Bank Transfer', cheque: 'Cheque', cash: 'Cash', card: 'Card' };

function InfoRow({ label, value }) {
    if (value == null || value === '') return null;
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{value}</span>
        </div>
    );
}

function RecordPaymentModal({ payment, tenancyId, onClose }) {
    const currency = useCurrency();
    const { data, setData, post, processing, errors } = useForm({
        paid_date:      new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        amount:         payment.amount,
        reference:      '',
        notes:          '',
    });

    function submit(e) {
        e.preventDefault();
        post(`/tenancies/${tenancyId}/payments/${payment.id}/record`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Record Payment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount ({currency}) *</label>
                        <input type="number" step="0.01" value={data.amount}
                            onChange={e => setData('amount', e.target.value)} className={inputCls} />
                        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Date *</label>
                        <input type="date" value={data.paid_date}
                            onChange={e => setData('paid_date', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method *</label>
                        <select value={data.payment_method}
                            onChange={e => setData('payment_method', e.target.value)} className={inputCls}>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reference / Cheque No.</label>
                        <input value={data.reference} onChange={e => setData('reference', e.target.value)}
                            className={inputCls} placeholder="Optional" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                        <textarea rows={2} value={data.notes} onChange={e => setData('notes', e.target.value)}
                            className={`${inputCls} resize-none`} />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold">
                            {processing ? 'Saving…' : 'Record Payment'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TerminateModal({ tenancyId, onClose }) {
    const { data, setData, post, processing } = useForm({
        termination_date:   new Date().toISOString().split('T')[0],
        termination_reason: '',
    });

    function submit(e) {
        e.preventDefault();
        post(`/tenancies/${tenancyId}/terminate`, {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Terminate Tenancy</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Termination Date *</label>
                        <input type="date" value={data.termination_date}
                            onChange={e => setData('termination_date', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                        <textarea rows={3} value={data.termination_reason}
                            onChange={e => setData('termination_reason', e.target.value)}
                            className={`${inputCls} resize-none`} placeholder="Optional reason for termination" />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold">
                            {processing ? 'Processing…' : 'Terminate'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function TenanciesShow({ tenancy, payments, documents = [], documentTypes = [] }) {
    const currency = useCurrency();
    const [recordingPayment, setRecordingPayment] = useState(null);
    const [showTerminate, setShowTerminate]       = useState(false);

    const totalRent = payments.reduce((s, p) => s + Number(p.amount), 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const overdue   = payments.filter(p => p.status === 'overdue').length;

    function handleReturnDeposit() {
        if (!confirm('Mark deposit as returned?')) return;
        router.post(`/tenancies/${tenancy.id}/return-deposit`, {}, { preserveScroll: true });
    }

    function handleDelete() {
        if (!confirm(`Delete tenancy ${tenancy.reference}? This cannot be undone.`)) return;
        router.delete(`/tenancies/${tenancy.id}`);
    }

    return (
        <AppLayout title={tenancy.reference}>
            {recordingPayment && (
                <RecordPaymentModal
                    payment={recordingPayment}
                    tenancyId={tenancy.id}
                    onClose={() => setRecordingPayment(null)}
                />
            )}
            {showTerminate && (
                <TerminateModal tenancyId={tenancy.id} onClose={() => setShowTerminate(false)} />
            )}

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <Link href="/tenancies" className="hover:text-indigo-600">Tenancies</Link>
                            <span>/</span>
                            <span className="text-gray-700 font-medium">{tenancy.reference}</span>
                        </nav>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900">{tenancy.reference}</h1>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[tenancy.status]}`}>
                                {tenancy.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <a href={`/tenancies/${tenancy.id}/pdf`}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-700 font-medium">
                            ↓ Agreement
                        </a>
                        <Link href={`/tenancies/${tenancy.id}/edit`}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 font-medium">
                            Edit
                        </Link>
                        {['pending', 'active'].includes(tenancy.status) && (
                            <button onClick={() => setShowTerminate(true)}
                                className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium">
                                Terminate
                            </button>
                        )}
                        <button onClick={handleDelete}
                            className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium">
                            Delete
                        </button>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Rent', value: `RWF ${Number(totalRent).toLocaleString()}` },
                        { label: 'Collected', value: `RWF ${Number(totalPaid).toLocaleString()}`, color: 'text-green-600' },
                        { label: 'Outstanding', value: `RWF ${Number(totalRent - totalPaid).toLocaleString()}`, color: 'text-amber-600' },
                        { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-red-600' : 'text-gray-700' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
                            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                            <p className={`text-lg font-bold ${card.color ?? 'text-gray-900'}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Left: details */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Tenancy details */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Details</h2>
                            <InfoRow label="Reference" value={tenancy.reference} />
                            <InfoRow label="Start Date" value={tenancy.start_date} />
                            <InfoRow label="End Date" value={tenancy.end_date} />
                            <InfoRow label="Rent" value={`${currency} ${Number(tenancy.rent_amount).toLocaleString()} ${FREQ_LABELS[tenancy.rent_frequency] ?? ''}`} />
                            {tenancy.deposit_amount && (
                                <InfoRow label="Deposit"
                                    value={`RWF ${Number(tenancy.deposit_amount).toLocaleString()}${tenancy.deposit_returned_at ? ' (returned ' + tenancy.deposit_returned_at + ')' : ''}`} />
                            )}
                            <InfoRow label="Auto Renew" value={tenancy.auto_renew ? `Yes (${tenancy.renewal_notice_days}d notice)` : 'No'} />
                            {tenancy.termination_date && (
                                <InfoRow label="Terminated" value={tenancy.termination_date} />
                            )}
                            {tenancy.termination_reason && (
                                <InfoRow label="Reason" value={tenancy.termination_reason} />
                            )}
                            {tenancy.notes && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{tenancy.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Linked records */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Linked Records</h2>
                            {tenancy.property && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">Property</p>
                                    <Link href={`/properties/${tenancy.property.id}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                        {tenancy.property.reference} — {tenancy.property.title}
                                    </Link>
                                    {tenancy.unit && (
                                        <p className="text-xs text-gray-500 mt-0.5">Unit {tenancy.unit.unit_number}</p>
                                    )}
                                </div>
                            )}
                            {tenancy.tenant && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">Tenant</p>
                                    <Link href={`/contacts/${tenancy.tenant.id}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                        {tenancy.tenant.name}
                                    </Link>
                                    {tenancy.tenant.phone && (
                                        <p className="text-xs text-gray-500 mt-0.5">{tenancy.tenant.phone}</p>
                                    )}
                                </div>
                            )}
                            {tenancy.deal && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">Deal</p>
                                    <Link href={`/deals/${tenancy.deal.id}`}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                        {tenancy.deal.reference}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Documents */}
                        <DocumentPanel
                            documents={documents}
                            documentTypes={documentTypes}
                            subject={{ type: 'tenancy', id: tenancy.id }}
                        />

                        {/* Deposit actions */}
                        {tenancy.deposit_amount && !tenancy.deposit_returned_at && tenancy.status !== 'pending' && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-3">Deposit</h2>
                                <p className="text-sm text-gray-600 mb-3">
                                    {currency} {Number(tenancy.deposit_amount).toLocaleString()} — not yet returned
                                </p>
                                <button onClick={handleReturnDeposit}
                                    className="w-full py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 font-medium">
                                    Mark as Returned
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: payment schedule */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-700">Payment Schedule</h2>
                                <p className="text-xs text-gray-400 mt-0.5">{payments.length} payments</p>
                            </div>
                            {payments.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            {['Due Date', 'Amount', 'Method', 'Ref', 'Status', ''].map(h => (
                                                <th key={h} className="py-2.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm text-gray-700">
                                                    {p.due_date}
                                                    {p.paid_date && p.paid_date !== p.due_date && (
                                                        <p className="text-xs text-gray-400">Paid {p.paid_date}</p>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                                                    {currency} {Number(p.amount).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-gray-500">
                                                    {p.payment_method ? METHOD_LABELS[p.payment_method] : '—'}
                                                </td>
                                                <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                                                    {p.reference ?? '—'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PAY_STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {['pending', 'overdue', 'partial'].includes(p.status) && (
                                                            <button onClick={() => setRecordingPayment(p)}
                                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">
                                                                Record →
                                                            </button>
                                                        )}
                                                        {p.status === 'paid' && (
                                                            <a href={`/tenancies/payments/${p.id}/receipt`}
                                                                className="text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap">
                                                                ↓ Receipt
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-10 text-center text-gray-400 text-sm">No payments scheduled.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
