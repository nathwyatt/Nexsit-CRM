import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TaskPanel from '@/Components/Task/TaskPanel';
import ActivityFeed from '@/Components/Task/ActivityFeed';
import DocumentPanel from '@/Components/Document/DocumentPanel';
import WhatsappButton from '@/Components/WhatsappButton';

const STATUS_STYLES = {
    open:    { badge: 'bg-indigo-100 text-indigo-700',  label: 'Open' },
    won:     { badge: 'bg-green-100 text-green-700',    label: 'Won' },
    lost:    { badge: 'bg-red-100 text-red-700',        label: 'Lost' },
    on_hold: { badge: 'bg-amber-100 text-amber-700',    label: 'On Hold' },
};

function ActionsPanel({ deal, stages, agents }) {
    const [showLostReason, setShowLostReason] = useState(deal.status === 'lost');

    const { data: stageData, setData: setStageData, patch: patchStage, processing: stageProcessing } = useForm({
        stage_id: deal.stage?.id ?? '',
    });

    const { data: statusData, setData: setStatusData, patch: patchStatus, processing: statusProcessing } = useForm({
        status:      deal.status,
        lost_reason: deal.lost_reason ?? '',
    });

    const { data: assignData, setData: setAssignData, patch: patchAssign, processing: assignProcessing } = useForm({
        assigned_to: deal.assigned_to?.id ?? '',
    });

    return (
        <div className="space-y-5">
            {/* Move stage */}
            <form onSubmit={e => { e.preventDefault(); patchStage(`/deals/${deal.id}/stage`, { preserveScroll: true }); }}
                className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Move stage</label>
                <div className="flex gap-2">
                    <select value={stageData.stage_id}
                        onChange={e => setStageData('stage_id', e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button type="submit" disabled={stageProcessing}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 shrink-0">
                        {stageProcessing ? '…' : 'Move'}
                    </button>
                </div>
            </form>

            {/* Status */}
            <form onSubmit={e => { e.preventDefault(); patchStatus(`/deals/${deal.id}/status`, { preserveScroll: true }); }}
                className="space-y-3">
                <label className="block text-xs font-medium text-gray-700">Change status</label>
                <div className="flex flex-wrap gap-2">
                    {['open', 'on_hold', 'won', 'lost'].map(s => (
                        <button key={s} type="button"
                            onClick={() => { setStatusData('status', s); setShowLostReason(s === 'lost'); }}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium border transition-all ${
                                statusData.status === s
                                    ? STATUS_STYLES[s].badge + ' border-transparent ring-2 ring-offset-1 ring-indigo-400'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                            }`}>
                            {STATUS_STYLES[s]?.label ?? s}
                        </button>
                    ))}
                </div>
                {showLostReason && (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Lost reason</label>
                        <textarea rows={2} value={statusData.lost_reason}
                            onChange={e => setStatusData('lost_reason', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Why was this deal lost?" />
                    </div>
                )}
                <button type="submit" disabled={statusProcessing}
                    className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {statusProcessing ? 'Saving…' : 'Update status'}
                </button>
            </form>

            {/* Assign */}
            <form onSubmit={e => { e.preventDefault(); patchAssign(`/deals/${deal.id}/assign`, { preserveScroll: true }); }}
                className="flex gap-2 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assign to</label>
                    <select value={assignData.assigned_to}
                        onChange={e => setAssignData('assigned_to', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">— Unassigned —</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
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

function DetailRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 font-medium">{value}</span>
        </div>
    );
}

export default function DealShow({ deal, stages, agents, tasks, activities, taskTypes, subject, documents, documentTypes }) {
    function deleteDeal() {
        if (!confirm(`Delete ${deal.reference}?`)) return;
        router.delete(`/deals/${deal.id}`);
    }

    const statusStyle = STATUS_STYLES[deal.status] ?? STATUS_STYLES.open;
    const currentIdx  = stages.findIndex(s => s.id === deal.stage?.id);

    return (
        <AppLayout title={deal.reference}>
            <div className="max-w-5xl space-y-5">
                {/* Breadcrumb */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/deals" className="hover:text-indigo-600">Deals</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{deal.reference}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <WhatsappButton
                            phone={deal.contact?.phone ?? null}
                            module="deal"
                            modelId={deal.id}
                        />
                        <Link href={`/deals/${deal.id}/edit`}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-indigo-400">
                            Edit
                        </Link>
                        <button onClick={deleteDeal}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50">
                            Delete
                        </button>
                    </div>
                </div>

                {/* Header card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-gray-400">{deal.reference}</span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusStyle.badge}`}>
                                    {statusStyle.label}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                    deal.type === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>{deal.type}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">{deal.title}</h2>
                            <p className="text-xs text-gray-400 mt-1">Created {deal.created_at}</p>
                        </div>
                        {deal.value && (
                            <div className="text-right shrink-0">
                                <p className="text-xs text-gray-400">Deal value</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {deal.currency} {Number(deal.value).toLocaleString()}
                                </p>
                                {deal.commission_pct && (
                                    <p className="text-xs text-gray-400">
                                        {deal.commission_pct}% commission
                                        {deal.commission
                                            ? ` = ${deal.currency} ${Number(deal.commission).toLocaleString()}`
                                            : ''}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stage progress bar */}
                    {stages.length > 0 && (
                        <div className="mt-4">
                            <div className="flex gap-1">
                                {stages.map((s, i) => (
                                    <div
                                        key={s.id}
                                        className="flex-1 h-1.5 rounded-full transition-all"
                                        style={{
                                            backgroundColor: s.color,
                                            opacity: i <= currentIdx ? 1 : 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {deal.pipeline?.name} → {deal.stage?.name ?? 'Unknown stage'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-5">
                    {/* Left: details */}
                    <div className="col-span-2 space-y-5">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Deal Details</h3>
                            <DetailRow label="Pipeline"       value={deal.pipeline?.name} />
                            <DetailRow label="Stage"         value={deal.stage?.name} />
                            <DetailRow label="Type"          value={deal.type === 'sale' ? 'Sale' : 'Rental'} />
                            <DetailRow label="Assigned to"   value={deal.assigned_to?.name} />
                            <DetailRow label="Expected close" value={deal.expected_close_date} />
                            <DetailRow label="Closed at"     value={deal.closed_at} />
                            {deal.status === 'lost' && deal.lost_reason && (
                                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                    <p className="text-xs text-red-500 font-medium mb-1">Lost reason</p>
                                    <p className="text-sm text-red-700">{deal.lost_reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact</h3>
                            {deal.contact ? (
                                <Link href={`/contacts/${deal.contact.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-200 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                                        {deal.contact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{deal.contact.name}</p>
                                        <p className="text-xs text-gray-400">{deal.contact.email ?? deal.contact.phone}</p>
                                    </div>
                                    <span className="ml-auto text-xs text-indigo-500">View →</span>
                                </Link>
                            ) : (
                                <p className="text-sm text-gray-400 py-2">No contact linked.</p>
                            )}
                        </div>

                        {/* Property */}
                        {deal.property && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Property</h3>
                                <Link href={`/properties/${deal.property.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-200">
                                    <div className="text-2xl">⌂</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{deal.property.title}</p>
                                        <p className="text-xs font-mono text-gray-400">{deal.property.reference}</p>
                                    </div>
                                    <span className="ml-auto text-xs text-indigo-500">View →</span>
                                </Link>
                            </div>
                        )}

                        {/* Source lead */}
                        {deal.lead && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Source Lead</h3>
                                <Link href={`/leads/${deal.lead.id}`}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-mono">
                                    {deal.lead.reference} →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right: actions + tasks + activity */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
                            <ActionsPanel deal={deal} stages={stages} agents={agents} />
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
