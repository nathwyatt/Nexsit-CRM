import { useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function ViewingCreate({ properties, contacts, agents, leads, prefill }) {
    const { data, setData, post, processing, errors } = useForm({
        property_id:      prefill.property_id ?? '',
        contact_id:       prefill.contact_id ?? '',
        lead_id:          prefill.lead_id ?? '',
        assigned_to:      '',
        scheduled_at:     '',
        duration_minutes: 60,
        notes:            '',
    });

    // When a lead is selected, auto-fill contact if the lead has one
    function handleLeadChange(leadId) {
        setData('lead_id', leadId);
        if (leadId) {
            const lead = leads.find((l) => l.id === Number(leadId));
            // We don't have contact_id in the lead payload here — user can set it manually
        }
    }

    function submit(e) {
        e.preventDefault();
        post('/viewings');
    }

    const Field = ({ label, error, required, children }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );

    const inputCls = (err) =>
        `block w-full rounded-xl border px-3 py-2.5 text-sm text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${err ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`;

    return (
        <AppLayout title="Book Viewing">
            <div className="max-w-2xl">
                {/* Back link */}
                <Link href="/viewings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    Back to viewings
                </Link>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zm4.5-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Schedule a Viewing</h2>
                            <p className="text-xs text-gray-500">Book a property viewing for a client</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-5">
                        <Field label="Property" required error={errors.property_id}>
                            <select value={data.property_id}
                                onChange={(e) => setData('property_id', e.target.value)}
                                className={inputCls(errors.property_id)}>
                                <option value="">Select a property…</option>
                                {properties.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.reference} — {p.title}{p.community ? ` (${p.community})` : ''}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Client / Contact" error={errors.contact_id}>
                                <select value={data.contact_id}
                                    onChange={(e) => setData('contact_id', e.target.value)}
                                    className={inputCls(errors.contact_id)}>
                                    <option value="">Select a contact…</option>
                                    {contacts.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}{c.phone ? ` — ${c.phone}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Related Lead" error={errors.lead_id}>
                                <select value={data.lead_id}
                                    onChange={(e) => handleLeadChange(e.target.value)}
                                    className={inputCls(errors.lead_id)}>
                                    <option value="">None</option>
                                    {leads.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.reference}{l.contact_name ? ` — ${l.contact_name}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <Field label="Assigned Agent" required error={errors.assigned_to}>
                            <select value={data.assigned_to}
                                onChange={(e) => setData('assigned_to', e.target.value)}
                                className={inputCls(errors.assigned_to)}>
                                <option value="">Select an agent…</option>
                                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Date & Time" required error={errors.scheduled_at}>
                                <input
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    className={inputCls(errors.scheduled_at)}
                                />
                            </Field>

                            <Field label="Duration" required error={errors.duration_minutes}>
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
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                placeholder="Any special requirements, access instructions, etc."
                                className={inputCls(errors.notes) + ' resize-none'}
                            />
                        </Field>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Link href="/viewings"
                                className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing}
                                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90 disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                                {processing ? 'Scheduling…' : 'Schedule Viewing'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
