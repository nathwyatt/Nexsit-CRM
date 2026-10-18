import { useState } from 'react';

const ID_TYPES = [
    { value: 'passport',    label: 'Passport' },
    { value: 'national_id', label: 'National ID' },
    { value: 'other',       label: 'Other' },
];

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}

function Input({ ...props }) {
    return (
        <input className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" {...props} />
    );
}

function Select({ children, ...props }) {
    return (
        <select className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" {...props}>
            {children}
        </select>
    );
}

export default function ContactForm({ data, setData, errors, agents }) {
    const [tagInput, setTagInput] = useState('');

    function addTag(e) {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault();
            const tag = tagInput.trim().replace(/,$/, '');
            if (tag && !data.tags.includes(tag)) {
                setData('tags', [...data.tags, tag]);
            }
            setTagInput('');
        }
    }

    function removeTag(tag) {
        setData('tags', data.tags.filter((t) => t !== tag));
    }

    return (
        <div className="space-y-5">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="First name *" error={errors.first_name}>
                    <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="Jean" />
                </Field>
                <Field label="Last name *" error={errors.last_name}>
                    <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="Uwimana" />
                </Field>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="Email" error={errors.email}>
                    <Input type="email" value={data.email ?? ''} onChange={(e) => setData('email', e.target.value || null)} placeholder="name@example.com" />
                </Field>
                <Field label="Phone" error={errors.phone}>
                    <Input value={data.phone ?? ''} onChange={(e) => setData('phone', e.target.value || null)} placeholder="07XX XXX XXX" />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Phone 2" error={errors.phone_2}>
                    <Input value={data.phone_2 ?? ''} onChange={(e) => setData('phone_2', e.target.value || null)} />
                </Field>
                <Field label="Nationality" error={errors.nationality}>
                    <Input value={data.nationality ?? ''} onChange={(e) => setData('nationality', e.target.value || null)} placeholder="Rwandan" />
                </Field>
            </div>

            {/* ID */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="ID Type" error={errors.id_type}>
                    <Select value={data.id_type ?? ''} onChange={(e) => setData('id_type', e.target.value || null)}>
                        <option value="">— Select —</option>
                        {ID_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                </Field>
                <Field label="ID Number" error={errors.id_number}>
                    <Input value={data.id_number ?? ''} onChange={(e) => setData('id_number', e.target.value || null)} />
                </Field>
            </div>

            {/* Address */}
            <Field label="Address" error={errors.address}>
                <textarea rows={2} value={data.address ?? ''} onChange={(e) => setData('address', e.target.value || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Full address…" />
            </Field>

            {/* Notes */}
            <Field label="Notes" error={errors.notes}>
                <textarea rows={3} value={data.notes ?? ''} onChange={(e) => setData('notes', e.target.value || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Internal notes about this contact…" />
            </Field>

            {/* Tags */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {data.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-indigo-700 leading-none">×</button>
                        </span>
                    ))}
                </div>
                <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type tag and press Enter…"
                />
            </div>

            {/* Assigned to */}
            <Field label="Assigned to" error={errors.assigned_to}>
                <Select value={data.assigned_to ?? ''} onChange={(e) => setData('assigned_to', e.target.value || null)}>
                    <option value="">— Unassigned —</option>
                    {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
            </Field>
        </div>
    );
}
