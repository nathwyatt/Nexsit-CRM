import { useState, useEffect } from 'react';

const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const Input = ({ className, ...props }) => (
    <input
        {...props}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className ?? ''}`}
    />
);

const Select = ({ children, ...props }) => (
    <select
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
        {children}
    </select>
);

export default function DealForm({ data, setData, errors, pipelines, contacts, properties, agents }) {
    const [stages, setStages] = useState([]);

    useEffect(() => {
        const pipeline = pipelines.find(p => String(p.id) === String(data.pipeline_id));
        setStages(pipeline?.stages ?? []);
    }, [data.pipeline_id, pipelines]);

    function changePipeline(id) {
        const pipeline = pipelines.find(p => String(p.id) === String(id));
        const firstStage = pipeline?.stages?.[0];
        setData(prev => ({
            ...prev,
            pipeline_id: id || null,
            stage_id:    firstStage?.id ?? null,
        }));
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <Field label="Pipeline *" error={errors.pipeline_id}>
                    <Select value={data.pipeline_id ?? ''} onChange={e => changePipeline(e.target.value)}>
                        <option value="">Select pipeline</option>
                        {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                </Field>
                <Field label="Stage *" error={errors.stage_id}>
                    <Select value={data.stage_id ?? ''} onChange={e => setData('stage_id', e.target.value || null)}>
                        <option value="">Select stage</option>
                        {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                </Field>
            </div>

            <Field label="Title *" error={errors.title}>
                <Input
                    type="text"
                    value={data.title ?? ''}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="e.g. John Doe — NST-000001"
                />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Contact *" error={errors.contact_id}>
                    <Select value={data.contact_id ?? ''} onChange={e => setData('contact_id', e.target.value || null)}>
                        <option value="">Select contact</option>
                        {contacts.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}{c.phone ? ` (${c.phone})` : ''}
                                {c.roles?.length ? ` · ${c.roles.join(', ')}` : ''}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label="Type *" error={errors.type}>
                    <Select value={data.type ?? 'sale'} onChange={e => setData('type', e.target.value)}>
                        <option value="sale">Sale</option>
                        <option value="rental">Rental</option>
                    </Select>
                </Field>
            </div>

            <Field label="Property" error={errors.property_id}>
                <Select value={data.property_id ?? ''} onChange={e => setData('property_id', e.target.value || null)}>
                    <option value="">— None —</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Deal value (AED)" error={errors.value}>
                    <Input
                        type="number" min="0" step="0.01"
                        value={data.value ?? ''}
                        onChange={e => setData('value', e.target.value || null)}
                        placeholder="0.00"
                    />
                </Field>
                <Field label="Commission %" error={errors.commission_pct}>
                    <Input
                        type="number" min="0" max="100" step="0.01"
                        value={data.commission_pct ?? ''}
                        onChange={e => setData('commission_pct', e.target.value || null)}
                        placeholder="e.g. 2.00"
                    />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Expected close date" error={errors.expected_close_date}>
                    <Input
                        type="date"
                        value={data.expected_close_date ?? ''}
                        onChange={e => setData('expected_close_date', e.target.value || null)}
                    />
                </Field>
                <Field label="Assigned to" error={errors.assigned_to}>
                    <Select value={data.assigned_to ?? ''} onChange={e => setData('assigned_to', e.target.value || null)}>
                        <option value="">— Unassigned —</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                </Field>
            </div>
        </div>
    );
}
