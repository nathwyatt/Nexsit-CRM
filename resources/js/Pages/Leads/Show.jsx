import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TaskPanel from '@/Components/Task/TaskPanel';
import ActivityFeed from '@/Components/Task/ActivityFeed';
import DocumentPanel from '@/Components/Document/DocumentPanel';
import WhatsappButton from '@/Components/WhatsappButton';

const STATUS_STYLES = {
    new:       { badge: 'bg-gray-100 text-gray-600',    label: 'New' },
    contacted: { badge: 'bg-blue-100 text-blue-700',    label: 'Contacted' },
    qualified: { badge: 'bg-amber-100 text-amber-700',  label: 'Qualified' },
    converted: { badge: 'bg-green-100 text-green-700',  label: 'Converted' },
    lost:      { badge: 'bg-red-100 text-red-700',      label: 'Lost' },
};

const ALL_STATUSES = ['new', 'contacted', 'qualified', 'lost'];

function StatusPanel({ lead, agents }) {
    const [showLostReason, setShowLostReason] = useState(lead.status === 'lost');
    const { data, setData, patch, processing } = useForm({
        status:      lead.status,
        lost_reason: lead.lost_reason ?? '',
    });

    const { data: assignData, setData: setAssignData, patch: patchAssign, processing: assignProcessing } = useForm({
        assigned_to: lead.assigned_to?.id ?? '',
    });

    function submitStatus(e) {
        e.preventDefault();
        patch(`/leads/${lead.id}/status`, { preserveScroll: true });
    }

    function submitAssign(e) {
        e.preventDefault();
        patchAssign(`/leads/${lead.id}/assign`, { preserveScroll: true });
    }

    return (
        <div className="space-y-4">
            {/* Status */}
            {lead.status !== 'converted' && (
                <form onSubmit={submitStatus} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Change status</label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_STATUSES.map((s) => (
                                <button key={s} type="button"
                                    onClick={() => { setData('status', s); setShowLostReason(s === 'lost'); }}
                                    className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-all capitalize ${
                                        data.status === s
                                            ? STATUS_STYLES[s].badge + ' border-transparent ring-2 ring-offset-1 ring-indigo-400'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                    }`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    {showLostReason && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Lost reason</label>
                            <textarea rows={2} value={data.lost_reason}
                                onChange={(e) => setData('lost_reason', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Why was this lead lost?" />
                        </div>
                    )}
                    <button type="submit" disabled={processing}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {processing ? 'Saving…' : 'Update status'}
                    </button>
                </form>
            )}

            {/* Assign */}
            <form onSubmit={submitAssign} className="flex gap-2 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign to</label>
                    <select value={assignData.assigned_to}
                        onChange={(e) => setAssignData('assigned_to', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">— Unassigned —</option>
                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={assignProcessing}
                    className="px-4 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 shrink-0">
                    {assignProcessing ? '…' : 'Assign'}
                </button>
            </form>
        </div>
    );
}

function ConvertPanel({ lead }) {
    const [confirm, setConfirm] = useState(false);
    const { post, processing } = useForm();

    if (lead.status === 'converted') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">Converted to deal</p>
                {lead.converted_deal && (
                    <Link href={`/deals/${lead.converted_deal.id}`}
                        className="text-sm text-green-700 hover:text-green-900 font-mono">
                        {lead.converted_deal.reference} — {lead.converted_deal.title}
                    </Link>
                )}
                <p className="text-xs text-green-600 mt-1">Converted on {lead.converted_at}</p>
            </div>
        );
    }

    if (!lead.contact) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                    Link a contact before converting this lead to a deal.
                </p>
                <Link href={`/leads/${lead.id}/edit`} className="text-xs text-amber-700 hover:underline mt-1 inline-block">
                    Edit lead → link contact
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-indigo-900">
                Convert <strong>{lead.contact.name}</strong>'s lead into a deal in the default pipeline.
            </p>
            {!confirm ? (
                <button onClick={() => setConfirm(true)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                    Convert to deal →
                </button>
            ) : (
                <div className="flex gap-2">
                    <button disabled={processing}
                        onClick={() => post(`/leads/${lead.id}/convert`)}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {processing ? 'Converting…' : 'Confirm convert'}
                    </button>
                    <button onClick={() => setConfirm(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 font-medium">{value}</span>
        </div>
    );
}

export default function LeadShow({ lead, agents, tasks, activities, taskTypes, subject, documents, documentTypes, match_count }) {
    function deleteLead() {
        if (!confirm(`Delete ${lead.reference}?`)) return;
        router.delete(`/leads/${lead.id}`);
    }

    const statusStyle = STATUS_STYLES[lead.status] ?? STATUS_STYLES.new;

    return (
        <AppLayout title={lead.reference}>
            <div className="max-w-5xl space-y-5">
                {/* Breadcrumb + actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/leads" className="hover:text-emerald-600">Leads</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{lead.reference}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        {match_count > 0 && (
                            <Link href={`/leads/${lead.id}/matches`}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold text-white shadow-sm hover:opacity-90 transition"
                                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                </svg>
                                {match_count} Matches
                            </Link>
                        )}
                        <WhatsappButton
                            phone={lead.contact?.phone ?? null}
                            module="lead"
                            modelId={lead.id}
                        />
                        <Link href={`/leads/${lead.id}/edit`}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-emerald-400">
                            Edit
                        </Link>
                        <button onClick={deleteLead}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50">
                            Delete
                        </button>
                    </div>
                </div>

                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-gray-400">{lead.reference}</span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusStyle.badge}`}>
                                    {statusStyle.label}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                    lead.purpose === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>{lead.purpose}</span>
                            </div>
                            <p className="text-xs text-gray-400">Created {lead.created_at}</p>
                        </div>
                        {lead.budget_max && (
                            <div className="text-right shrink-0">
                                <p className="text-xs text-gray-400">Budget</p>
                                <p className="text-lg font-bold text-gray-900">
                                    RWF {Number(lead.budget_max).toLocaleString()}
                                </p>
                                {lead.budget_min && (
                                    <p className="text-xs text-gray-400">from RWF {Number(lead.budget_min).toLocaleString()}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                    {/* Left: details */}
                    <div className="col-span-2 space-y-5">
                        {/* Lead details */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Lead Details</h3>
                            <DetailRow label="Source" value={lead.source ? `${lead.source.name}` : null} />
                            <DetailRow label="Source detail" value={lead.source_detail} />
                            <DetailRow label="Bedrooms wanted" value={lead.bedrooms_wanted} />
                            <DetailRow label="Assigned to" value={lead.assigned_to?.name} />
                            {lead.status === 'lost' && lead.lost_reason && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                    <p className="text-xs text-red-500 font-medium mb-1">Lost reason</p>
                                    <p className="text-sm text-red-700">{lead.lost_reason}</p>
                                </div>
                            )}
                            {lead.message && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-400 mb-1">Message</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.message}</p>
                                </div>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact</h3>
                            {lead.contact ? (
                                <Link href={`/contacts/${lead.contact.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-200 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                                        {lead.contact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{lead.contact.name}</p>
                                        <p className="text-xs text-gray-400">{lead.contact.email ?? lead.contact.phone}</p>
                                    </div>
                                    <span className="ml-auto text-xs text-indigo-500">View →</span>
                                </Link>
                            ) : (
                                <div className="text-center py-4 text-gray-400">
                                    <p className="text-sm mb-2">No contact linked.</p>
                                    <Link href={`/leads/${lead.id}/edit`} className="text-xs text-indigo-600 hover:underline">
                                        Link a contact →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Property */}
                        {lead.property && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Related Property</h3>
                                <Link href={`/properties/${lead.property.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-200">
                                    <div className="text-2xl">⌂</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{lead.property.title}</p>
                                        <p className="text-xs font-mono text-gray-400">{lead.property.reference}</p>
                                    </div>
                                    <span className="ml-auto text-xs text-indigo-500">View →</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right: actions + tasks + activity */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
                            <StatusPanel lead={lead} agents={agents} />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Convert</h3>
                            <ConvertPanel lead={lead} />
                        </div>

                        <TaskPanel tasks={tasks} taskTypes={taskTypes} agents={agents} subject={subject} />
                        <DocumentPanel documents={documents} documentTypes={documentTypes} subject={subject} />
                        <ActivityFeed activities={activities} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
