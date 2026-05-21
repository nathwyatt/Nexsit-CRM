import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const MODULES = [
    { value: 'general',  label: 'General',  color: 'bg-gray-100 text-gray-600' },
    { value: 'lead',     label: 'Leads',    color: 'bg-indigo-100 text-indigo-700' },
    { value: 'contact',  label: 'Contacts', color: 'bg-blue-100 text-blue-700' },
    { value: 'deal',     label: 'Deals',    color: 'bg-amber-100 text-amber-700' },
    { value: 'tenancy',  label: 'Tenancy',  color: 'bg-purple-100 text-purple-700' },
];

const VARS = {
    lead:    ['{{first_name}}', '{{name}}', '{{reference}}', '{{budget}}'],
    contact: ['{{first_name}}', '{{name}}', '{{email}}', '{{phone}}'],
    deal:    ['{{title}}', '{{reference}}', '{{value}}'],
    tenancy: ['{{reference}}', '{{property}}', '{{start_date}}', '{{end_date}}'],
    general: [],
};

function TemplateForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState(
        initial ?? { name: '', module: 'general', body: '', is_active: true }
    );

    const inp = 'border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500';

    function insertVar(v) {
        setForm(f => ({ ...f, body: f.body + v }));
    }

    return (
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Template name *</label>
                    <input value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Lead Follow-up" className={inp} required />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Module *</label>
                    <select value={form.module}
                        onChange={e => setForm(f => ({ ...f, module: e.target.value }))}
                        className={inp}>
                        {MODULES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <div className="flex items-start justify-between mb-1 gap-2 flex-wrap">
                    <label className="block text-xs font-medium text-gray-600">Message *</label>
                    {VARS[form.module]?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {VARS[form.module].map(v => (
                                <button key={v} type="button" onClick={() => insertVar(v)}
                                    className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-mono hover:bg-green-200 transition-colors">
                                    {v}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <textarea rows={5} value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    placeholder="Hi {{first_name}}, thank you for reaching out to Nexsit Properties! I'd love to schedule a viewing for you. When would you be available?"
                    className={`${inp} resize-none font-mono text-xs leading-relaxed`} required />
                <p className="text-[11px] text-gray-400 mt-1">{form.body.length}/1000 chars</p>
            </div>

            <div className="flex gap-2">
                <button type="submit"
                    className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium">
                    {initial ? 'Save Changes' : 'Create Template'}
                </button>
                <button type="button" onClick={onCancel}
                    className="px-4 py-1.5 text-gray-600 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function WhatsappIndex({ templates }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing]       = useState(null);

    function handleCreate(form) {
        router.post('/settings/whatsapp', form, {
            onSuccess: () => setShowCreate(false),
        });
    }

    function handleUpdate(template, form) {
        router.patch(`/settings/whatsapp/${template.id}`, form, {
            onSuccess: () => setEditing(null),
            preserveScroll: true,
        });
    }

    function handleDelete(template) {
        if (!confirm(`Delete "${template.name}"?`)) return;
        router.delete(`/settings/whatsapp/${template.id}`, { preserveScroll: true });
    }

    function handleToggle(template) {
        router.patch(`/settings/whatsapp/${template.id}`, { is_active: !template.is_active }, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout title="WhatsApp Templates">
            <div className="max-w-4xl space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">WhatsApp Templates</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Pre-written messages with dynamic variables — send directly from leads, contacts, and deals.
                        </p>
                    </div>
                    {!showCreate && (
                        <button onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium flex items-center gap-1.5">
                            <span>+</span> New Template
                        </button>
                    )}
                </div>

                {/* Create form */}
                {showCreate && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-green-900 mb-4">New Template</h3>
                        <TemplateForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
                    </div>
                )}

                {/* How it works */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                    <span className="text-xl shrink-0">💬</span>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">How templates work</p>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Agents click the <strong>WhatsApp</strong> button on any lead, contact, or deal and choose a template.
                            Variables like{' '}
                            <code className="bg-blue-100 px-1 rounded font-mono">{'{{first_name}}'}</code>{' '}
                            are automatically filled in before opening WhatsApp with the pre-composed message.
                            Messages are logged as activities on the record.
                        </p>
                    </div>
                </div>

                {/* Template list */}
                {templates.length === 0 && !showCreate ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="text-gray-600 font-semibold">No templates yet</p>
                        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                            Create message templates to speed up WhatsApp communication with leads and contacts.
                        </p>
                        <button onClick={() => setShowCreate(true)}
                            className="mt-5 px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-semibold">
                            Create first template
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {MODULES.map(module => {
                            const items = templates.filter(t => t.module === module.value);
                            if (items.length === 0) return null;

                            return (
                                <div key={module.value}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${module.color}`}>
                                            {module.label}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {items.length} template{items.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                                        {items.map(t => (
                                            <div key={t.id}>
                                                {editing?.id === t.id ? (
                                                    <div className="p-5">
                                                        <TemplateForm initial={editing}
                                                            onSave={form => handleUpdate(t, form)}
                                                            onCancel={() => setEditing(null)} />
                                                    </div>
                                                ) : (
                                                    <div className={`flex gap-4 px-4 py-3.5 items-start ${!t.is_active ? 'opacity-50' : ''}`}>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                                                                {!t.is_active && (
                                                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                                                                        disabled
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1 font-mono leading-relaxed line-clamp-2">
                                                                {t.body}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                                            <button onClick={() => setEditing(t)}
                                                                className="text-xs px-2.5 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => handleToggle(t)}
                                                                className={`text-xs px-2.5 py-1 border rounded-lg ${
                                                                    t.is_active
                                                                        ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                                                }`}>
                                                                {t.is_active ? 'Disable' : 'Enable'}
                                                            </button>
                                                            <button onClick={() => handleDelete(t)}
                                                                className="text-xs px-2.5 py-1 border border-red-200 rounded-lg text-red-500 hover:bg-red-50">
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
