import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TaskPanel from '@/Components/Task/TaskPanel';
import ActivityFeed from '@/Components/Task/ActivityFeed';
import DocumentPanel from '@/Components/Document/DocumentPanel';
import WhatsappButton from '@/Components/WhatsappButton';
import { useCurrency, rentSuffix } from '@/Utils/format';

const ROLE_COLORS = {
    buyer:  'bg-blue-100 text-blue-700',
    tenant: 'bg-purple-100 text-purple-700',
    owner:  'bg-amber-100 text-amber-700',
};

const DEAL_STATUS_COLORS = {
    open:    'bg-blue-100 text-blue-700',
    won:     'bg-green-100 text-green-700',
    lost:    'bg-red-100 text-red-700',
    on_hold: 'bg-gray-100 text-gray-600',
};

const LEAD_STATUS_COLORS = {
    new:       'bg-indigo-100 text-indigo-700',
    contacted: 'bg-blue-100 text-blue-700',
    qualified: 'bg-amber-100 text-amber-700',
    converted: 'bg-green-100 text-green-700',
    lost:      'bg-red-100 text-red-700',
};

function RolesPanel({ contact }) {
    const availableRoles = ['buyer', 'tenant', 'owner'].filter(
        (r) => !contact.roles.find((cr) => cr.role === r)
    );

    const { data, setData, post, processing, reset } = useForm({ role: availableRoles[0] ?? '', notes: '' });

    function addRole(e) {
        e.preventDefault();
        post(`/contacts/${contact.id}/roles`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    function removeRole(role) {
        if (!confirm(`Remove ${role} role?`)) return;
        router.delete(`/contacts/${contact.id}/roles/${role}`, { preserveScroll: true });
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {contact.roles.length > 0 ? contact.roles.map((r) => (
                    <div key={r.role} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${ROLE_COLORS[r.role]}`}>
                        <span className="capitalize">{r.role}</span>
                        {r.notes && <span className="text-xs opacity-70">· {r.notes}</span>}
                        <button onClick={() => removeRole(r.role)} className="opacity-60 hover:opacity-100 text-base leading-none ml-1">×</button>
                    </div>
                )) : <p className="text-sm text-gray-400">No roles assigned yet.</p>}
            </div>

            {availableRoles.length > 0 && (
                <form onSubmit={addRole} className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Add role</label>
                        <select value={data.role} onChange={(e) => setData('role', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {availableRoles.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <input value={data.notes} onChange={(e) => setData('notes', e.target.value)}
                            placeholder="e.g. Primary buyer"
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <button type="submit" disabled={processing}
                        className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 shrink-0">
                        Add
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ContactShow({ contact, tasks, activities, taskTypes, subject, agents = [], documents = [], documentTypes = [] }) {
    const currency = useCurrency();
    const [tab, setTab] = useState('overview');

    const TABS = [
        { key: 'overview',    label: 'Overview' },
        { key: 'roles',       label: `Roles (${contact.roles.length})` },
        { key: 'properties',  label: `Properties (${contact.owned_properties?.length ?? 0})` },
        { key: 'leads',       label: `Leads (${contact.leads?.length ?? 0})` },
        { key: 'deals',       label: `Deals (${contact.deals?.length ?? 0})` },
        { key: 'tasks',       label: `Tasks (${tasks?.length ?? 0})` },
        { key: 'documents',   label: `Docs (${documents?.length ?? 0})` },
    ];

    function deleteContact() {
        if (!confirm(`Delete ${contact.name}? This cannot be undone.`)) return;
        router.delete(`/contacts/${contact.id}`);
    }

    return (
        <AppLayout title={contact.name}>
            <div className="max-w-4xl space-y-5">
                {/* Breadcrumb + actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/contacts" className="hover:text-indigo-600">Contacts</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{contact.name}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <WhatsappButton
                            phone={contact.phone ?? null}
                            module="contact"
                            modelId={contact.id}
                        />
                        <Link href={`/contacts/${contact.id}/edit`}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-indigo-400">
                            Edit
                        </Link>
                        <button onClick={deleteContact}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white border border-red-300 text-red-600 hover:bg-red-50">
                            Delete
                        </button>
                    </div>
                </div>

                {/* Header card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold shrink-0">
                            {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900">{contact.name}</h2>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                                {contact.email && <span>✉ {contact.email}</span>}
                                {contact.phone && <span>✆ {contact.phone}</span>}
                                {contact.nationality && <span>🌍 {contact.nationality}</span>}
                            </div>
                            {contact.tags?.length > 0 && (
                                <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {contact.tags.map((t) => (
                                        <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1.5 flex-wrap shrink-0">
                            {contact.roles.map((r) => (
                                <span key={r.role} className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_COLORS[r.role]}`}>
                                    {r.role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
                    {TABS.map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-4 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                                tab === t.key ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    {tab === 'overview' && (
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="space-y-3">
                                {[
                                    ['Phone 2',      contact.phone_2],
                                    ['ID Type',      contact.id_type?.replace('_', ' ')],
                                    ['ID Number',    contact.id_number],
                                    ['Assigned to',  contact.assigned_to?.name],
                                    ['Added by',     contact.created_by?.name],
                                    ['Added on',     contact.created_at],
                                ].map(([label, val]) => val ? (
                                    <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-xs text-gray-400">{label}</span>
                                        <span className="text-gray-800 capitalize">{val}</span>
                                    </div>
                                ) : null)}
                            </div>
                            <div>
                                {contact.address && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-400 mb-1">Address</p>
                                        <p className="text-gray-700 whitespace-pre-wrap">{contact.address}</p>
                                    </div>
                                )}
                                {contact.notes && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Notes</p>
                                        <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                                    </div>
                                )}
                                {!contact.address && !contact.notes && (
                                    <p className="text-gray-400 text-sm italic">No additional details.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'roles' && <RolesPanel contact={contact} />}

                    {tab === 'properties' && (
                        <div className="space-y-2">
                            {contact.owned_properties?.length > 0 ? contact.owned_properties.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/properties/${p.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate block">
                                            {p.title}
                                        </Link>
                                        <p className="text-xs text-gray-400">{p.reference}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                        p.pivot.is_primary ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {p.pivot.ownership_pct}% {p.pivot.is_primary ? '· Primary' : ''}
                                    </span>
                                </div>
                            )) : <p className="text-sm text-gray-400 py-6 text-center">No owned properties.</p>}
                        </div>
                    )}

                    {tab === 'leads' && (
                        <div className="space-y-2">
                            {contact.leads?.length > 0 ? contact.leads.map((l) => (
                                <Link key={l.id} href={`/leads/${l.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-200 transition-colors">
                                    <span className="font-mono text-xs text-gray-400 w-24 shrink-0">{l.reference}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${LEAD_STATUS_COLORS[l.status]}`}>{l.status}</span>
                                    <span className="text-xs text-gray-500 capitalize">{l.purpose}</span>
                                    <span className="ml-auto text-xs text-gray-400">{l.created_at}</span>
                                </Link>
                            )) : <p className="text-sm text-gray-400 py-6 text-center">No leads linked.</p>}
                        </div>
                    )}

                    {tab === 'deals' && (
                        <div className="space-y-2">
                            {contact.deals?.length > 0 ? contact.deals.map((d) => (
                                <Link key={d.id} href={`/deals/${d.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-indigo-200 transition-colors">
                                    <span className="font-mono text-xs text-gray-400 w-28 shrink-0">{d.reference}</span>
                                    <span className="text-sm text-gray-700 flex-1 truncate">{d.title}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${DEAL_STATUS_COLORS[d.status]}`}>
                                        {d.status === 'on_hold' ? 'On Hold' : d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                                    </span>
                                    {d.value && (
                                        <span className="text-xs font-medium text-gray-700 shrink-0">
                                            {currency} {Number(d.value).toLocaleString()}
                                        </span>
                                    )}
                                </Link>
                            )) : <p className="text-sm text-gray-400 py-6 text-center">No deals linked.</p>}
                        </div>
                    )}

                    {tab === 'tasks' && (
                        <div className="space-y-4">
                            <TaskPanel tasks={tasks ?? []} taskTypes={taskTypes ?? []} agents={agents} subject={subject} />
                            <ActivityFeed activities={activities ?? []} />
                        </div>
                    )}
                    {tab === 'documents' && (
                        <DocumentPanel documents={documents} documentTypes={documentTypes} subject={subject} />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
