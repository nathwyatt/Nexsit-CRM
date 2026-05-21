import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function ViewingEdit({ viewing, properties, contacts, agents, leads }) {
    const { data, setData, put, processing, errors } = useForm({
        property_id:      viewing.property_id ?? '',
        contact_id:       viewing.contact_id ?? '',
        lead_id:          viewing.lead_id ?? '',
        assigned_to:      viewing.assigned_to ?? '',
        scheduled_at:     viewing.scheduled_at ?? '',
        duration_minutes: viewing.duration_minutes ?? 60,
        status:           viewing.status ?? 'scheduled',
        notes:            viewing.notes ?? '',
        feedback:         viewing.feedback ?? '',
    });

    function submit(e) {
        e.preventDefault();
        put(`/viewings/${viewing.id}`);
    }

    const Field = ({ label, error, children }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );

    const inputCls = (err) =>
        `block w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${err ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`;

    return (
        <AppLayout title="Edit Viewing">
            <div className="max-w-2xl">
                <Link href={`/viewings/${viewing.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    Back to viewing
                </Link>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-base font-bold text-gray-900">Edit Viewing</h2>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-5">
                        <Field label="Property" error={errors.property_id}>
                            <select value={data.property_id}
                                onChange={(e) => setData('property_id', e.target.value)}
                                className={inputCls(errors.property_id)}>
                                <option value="">Select property…</option>
                                {properties.map((p) => (
                                    <option key={p.id} value={p.id}>{p.reference} — {p.title}</option>
                                ))}
                            </select>
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Contact" error={errors.contact_id}>
                                <select value={data.contact_id}
                                    onChange={(e) => setData('contact_id', e.target.value)}
                                    className={inputCls(errors.contact_id)}>
                                    <option value="">None</option>
                                    {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </Field>

                            <Field label="Lead" error={errors.lead_id}>
                                <select value={data.lead_id}
                                    onChange={(e) => setData('lead_id', e.target.value)}
                                    className={inputCls(errors.lead_id)}>
                                    <option value="">None</option>
                                    {leads.map((l) => <option key={l.id} value={l.id}>{l.reference}</option>)}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Assigned Agent" error={errors.assigned_to}>
                                <select value={data.assigned_to}
                                    onChange={(e) => setData('assigned_to', e.target.value)}
                                    className={inputCls(errors.assigned_to)}>
                                    <option value="">Select agent…</option>
                                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </Field>

                            <Field label="Status" error={errors.status}>
                                <select value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className={inputCls(errors.status)}>
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Date & Time" error={errors.scheduled_at}>
                                <input type="datetime-local" value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    className={inputCls(errors.scheduled_at)} />
                            </Field>

                            <Field label="Duration" error={errors.duration_minutes}>
                                <select value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', Number(e.target.value))}
                                    className={inputCls(errors.duration_minutes)}>
                                    {[15, 30, 45, 60, 90, 120, 180].map((m) => (
                                        <option key={m} value={m}>{m} minutes</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="Notes" error={errors.notes}>
                            <textarea value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3} className={inputCls(errors.notes) + ' resize-none'} />
                        </Field>

                        <Field label="Feedback" error={errors.feedback}>
                            <textarea value={data.feedback}
                                onChange={(e) => setData('feedback', e.target.value)}
                                rows={3}
                                placeholder="Agent notes after the viewing…"
                                className={inputCls(errors.feedback) + ' resize-none'} />
                        </Field>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link href={`/viewings/${viewing.id}`}
                                className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing}
                                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                                {processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
