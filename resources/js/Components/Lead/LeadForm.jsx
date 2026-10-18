import { useCurrency, rentSuffix } from '@/Utils/format';
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
    return <input className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" {...props} />;
}

function Select({ children, ...props }) {
    return (
        <select className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" {...props}>
            {children}
        </select>
    );
}

export default function LeadForm({ data, setData, errors, sources, agents, properties, contacts = [] }) {
    const currency = useCurrency();
    return (
        <div className="space-y-5">
            {/* Source */}
            <div className="grid grid-cols-2 gap-4">
                <Field label="Lead Source" error={errors.lead_source_id}>
                    <Select value={data.lead_source_id ?? ''}
                        onChange={(e) => setData('lead_source_id', e.target.value || null)}>
                        <option value="">— Select source —</option>
                        {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </Field>
                <Field label="Source detail" error={errors.source_detail}>
                    <Input value={data.source_detail ?? ''}
                        onChange={(e) => setData('source_detail', e.target.value || null)}
                        placeholder="Portal listing ID, referrer name…" />
                </Field>
            </div>

            {/* Purpose + bedrooms */}
            <div className="grid grid-cols-3 gap-4">
                <Field label="Purpose *" error={errors.purpose}>
                    <Select value={data.purpose} onChange={(e) => setData('purpose', e.target.value)}>
                        <option value="buy">Buy</option>
                        <option value="rent">Rent</option>
                    </Select>
                </Field>
                <Field label="Bedrooms wanted" error={errors.bedrooms_wanted}>
                    <Input type="number" min="0" value={data.bedrooms_wanted ?? ''}
                        onChange={(e) => setData('bedrooms_wanted', e.target.value || null)}
                        placeholder="Any" />
                </Field>
                <Field label="Assigned to" error={errors.assigned_to}>
                    <Select value={data.assigned_to ?? ''}
                        onChange={(e) => setData('assigned_to', e.target.value || null)}>
                        <option value="">— Unassigned —</option>
                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                </Field>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
                <Field label={`Budget min (${currency})`} error={errors.budget_min}>
                    <Input type="number" min="0" value={data.budget_min ?? ''}
                        onChange={(e) => setData('budget_min', e.target.value || null)} placeholder="0" />
                </Field>
                <Field label={`Budget max (${currency})`} error={errors.budget_max}>
                    <Input type="number" min="0" value={data.budget_max ?? ''}
                        onChange={(e) => setData('budget_max', e.target.value || null)} placeholder="0" />
                </Field>
            </div>

            {/* Contact */}
            <Field label="Contact" error={errors.contact_id}>
                <Select value={data.contact_id ?? ''}
                    onChange={(e) => setData('contact_id', e.target.value || null)}>
                    <option value="">— Link contact (optional) —</option>
                    {contacts.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} {c.phone ? `· ${c.phone}` : ''}</option>
                    ))}
                </Select>
            </Field>

            {/* Property */}
            <Field label="Related Property" error={errors.property_id}>
                <Select value={data.property_id ?? ''}
                    onChange={(e) => setData('property_id', e.target.value || null)}>
                    <option value="">— No specific property —</option>
                    {properties.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </Select>
            </Field>

            {/* Message */}
            <Field label="Message / Requirements" error={errors.message}>
                <textarea rows={4} value={data.message ?? ''}
                    onChange={(e) => setData('message', e.target.value || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Client's enquiry or specific requirements…" />
            </Field>
        </div>
    );
}
