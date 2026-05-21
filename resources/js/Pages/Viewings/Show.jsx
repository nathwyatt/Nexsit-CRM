import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_CONFIG = {
    scheduled: { label: 'Scheduled', bg: 'bg-blue-50 text-blue-700 ring-blue-200',         dot: 'bg-blue-400'    },
    confirmed: { label: 'Confirmed', bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    completed: { label: 'Completed', bg: 'bg-gray-100 text-gray-600 ring-gray-200',         dot: 'bg-gray-400'    },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50 text-red-700 ring-red-200',             dot: 'bg-red-400'     },
    no_show:   { label: 'No Show',   bg: 'bg-amber-50 text-amber-700 ring-amber-200',       dot: 'bg-amber-400'   },
};

const STATUS_TRANSITIONS = {
    scheduled: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'no_show', 'cancelled'],
    completed: [],
    cancelled: [],
    no_show:   [],
};

const TRANSITION_LABELS = {
    confirmed: 'Mark Confirmed',
    completed: 'Mark Completed',
    cancelled: 'Cancel Viewing',
    no_show:   'Mark No Show',
};

const TRANSITION_STYLES = {
    confirmed: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    completed: 'bg-gray-800 hover:bg-gray-900 text-white',
    cancelled: 'bg-red-600 hover:bg-red-700 text-white',
    no_show:   'bg-amber-500 hover:bg-amber-600 text-white',
};

function Detail({ label, children }) {
    return (
        <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
            <span className="text-xs text-gray-500 shrink-0">{label}</span>
            <div className="text-sm text-gray-800 font-medium text-right">{children}</div>
        </div>
    );
}

export default function ViewingShow({ viewing, propertyViewings }) {
    const sc = STATUS_CONFIG[viewing.status] ?? STATUS_CONFIG.scheduled;
    const transitions = STATUS_TRANSITIONS[viewing.status] ?? [];

    const [feedbackText, setFeedbackText] = useState(viewing.feedback ?? '');
    const [savingFeedback, setSavingFeedback] = useState(false);

    function updateStatus(newStatus) {
        if (newStatus === 'cancelled' && !confirm('Cancel this viewing?')) return;
        router.patch(`/viewings/${viewing.id}/status`, { status: newStatus }, { preserveScroll: true });
    }

    function saveFeedback() {
        setSavingFeedback(true);
        router.put(`/viewings/${viewing.id}`, {
            ...viewing,
            property_id:      viewing.property?.id,
            contact_id:       viewing.contact?.id,
            lead_id:          viewing.lead?.id,
            assigned_to:      viewing.assigned_to?.id,
            scheduled_at:     viewing.scheduled_iso,
            duration_minutes: viewing.duration_minutes,
            status:           viewing.status,
            notes:            viewing.notes,
            feedback:         feedbackText,
        }, {
            preserveScroll: true,
            onFinish: () => setSavingFeedback(false),
        });
    }

    function deleteViewing() {
        if (!confirm('Delete this viewing? This cannot be undone.')) return;
        router.delete(`/viewings/${viewing.id}`);
    }

    return (
        <AppLayout title="Viewing Detail">
            <div className="max-w-3xl space-y-5">

                {/* Back */}
                <Link href="/viewings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    Back to viewings
                </Link>

                {/* Header card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ring-1 ${sc.bg}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                        {sc.label}
                                    </span>
                                    <span className="text-xs text-gray-400">#{viewing.id}</span>
                                </div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    {viewing.property?.title ?? 'Viewing'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">{viewing.scheduled_at}</p>
                            </div>

                            {/* Status actions */}
                            <div className="flex flex-col gap-2 shrink-0">
                                {transitions.map((s) => (
                                    <button key={s}
                                        onClick={() => updateStatus(s)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${TRANSITION_STYLES[s]}`}>
                                        {TRANSITION_LABELS[s]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Left: viewing details */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Viewing Details</p>
                                {viewing.property && (
                                    <Detail label="Property">
                                        <Link href={`/properties/${viewing.property.id}`}
                                            className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                            {viewing.property.title}
                                        </Link>
                                        <div className="text-xs text-gray-400 font-mono">{viewing.property.reference}</div>
                                        {viewing.property.community && (
                                            <div className="text-xs text-gray-400">{viewing.property.community}, {viewing.property.city}</div>
                                        )}
                                    </Detail>
                                )}
                                <Detail label="Date & Time">{viewing.scheduled_at}</Detail>
                                <Detail label="Duration">{viewing.duration_minutes} minutes</Detail>
                                <Detail label="Agent">{viewing.assigned_to?.name ?? '—'}</Detail>
                                <Detail label="Booked on">{viewing.created_at}</Detail>
                            </div>

                            {/* Right: client details */}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Client Details</p>
                                {viewing.contact ? (
                                    <>
                                        <Detail label="Name">
                                            <Link href={`/contacts/${viewing.contact.id}`}
                                                className="text-indigo-600 hover:text-indigo-700 font-semibold">
                                                {viewing.contact.name}
                                            </Link>
                                        </Detail>
                                        {viewing.contact.phone && <Detail label="Phone">{viewing.contact.phone}</Detail>}
                                        {viewing.contact.email && <Detail label="Email">{viewing.contact.email}</Detail>}
                                    </>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No contact linked</p>
                                )}

                                {viewing.lead && (
                                    <Detail label="Lead">
                                        <Link href={`/leads/${viewing.lead.id}`}
                                            className="text-indigo-600 hover:text-indigo-700 font-mono text-sm">
                                            {viewing.lead.reference}
                                        </Link>
                                    </Detail>
                                )}

                                {viewing.notes && (
                                    <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{viewing.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-800">Agent Feedback</h3>
                        {feedbackText !== viewing.feedback && (
                            <button onClick={saveFeedback} disabled={savingFeedback}
                                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 transition">
                                {savingFeedback ? 'Saving…' : 'Save feedback'}
                            </button>
                        )}
                    </div>
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={4}
                        placeholder="Add your feedback about the viewing — client interest level, property concerns, follow-up actions needed…"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* Other viewings of same property */}
                {propertyViewings.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Other Viewings — {viewing.property?.reference}</h3>
                        <div className="space-y-2">
                            {propertyViewings.map((v) => {
                                const c = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.scheduled;
                                return (
                                    <Link key={v.id} href={`/viewings/${v.id}`}
                                        className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                                            <span className="text-sm text-gray-700 font-medium">{v.scheduled_at}</span>
                                            {v.contact && <span className="text-xs text-gray-400">— {v.contact}</span>}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ring-1 ${c.bg}`}>{c.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button onClick={deleteViewing}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete viewing
                    </button>
                    <Link href={`/viewings/${viewing.id}/edit`}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                        Edit details
                    </Link>
                </div>

            </div>
        </AppLayout>
    );
}
