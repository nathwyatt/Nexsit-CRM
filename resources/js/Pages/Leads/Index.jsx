import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_STYLES = {
    new:       'bg-gray-100 text-gray-600 ring-gray-200',
    contacted: 'bg-blue-50 text-blue-700 ring-blue-200',
    qualified: 'bg-amber-50 text-amber-700 ring-amber-200',
    converted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    lost:      'bg-red-50 text-red-700 ring-red-200',
};

const AVATAR_COLORS = [
    'from-violet-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-sky-400 to-blue-500',
    'from-pink-400 to-rose-500',
    'from-purple-400 to-fuchsia-500',
];

function Avatar({ name, size = 'sm' }) {
    const initials = name
        ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';
    const colorIdx = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
    const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center shrink-0 font-semibold text-white shadow-sm`}>
            {initials}
        </div>
    );
}

export default function LeadsIndex({ leads, sources, agents, filters }) {
    const [search, setSearch]     = useState(filters.search ?? '');
    const [status, setStatus]     = useState(filters.status ?? '');
    const [purpose, setPurpose]   = useState(filters.purpose ?? '');
    const [source, setSource]     = useState(filters.source ?? '');
    const [assigned, setAssigned] = useState(filters.assigned ?? '');

    function apply(overrides = {}) {
        router.get('/leads', { search, status, purpose, source, assigned, ...overrides }, {
            preserveState: true, replace: true,
        });
    }

    return (
        <AppLayout title="Leads">
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-48">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </span>
                        <input value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && apply({ search })}
                            placeholder="Search ref, name, email, phone…"
                            className="w-full rounded-xl border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" />
                    </div>

                    {[
                        { value: status, set: setStatus, key: 'status', label: 'All statuses',
                          opts: ['new','contacted','qualified','converted','lost'] },
                        { value: purpose, set: setPurpose, key: 'purpose', label: 'All purposes',
                          opts: ['buy','rent'] },
                    ].map(({ value, set, key, label, opts }) => (
                        <select key={key} value={value}
                            onChange={(e) => { set(e.target.value); apply({ [key]: e.target.value }); }}
                            className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                            <option value="">{label}</option>
                            {opts.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                        </select>
                    ))}

                    <select value={source}
                        onChange={(e) => { setSource(e.target.value); apply({ source: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">All sources</option>
                        {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>

                    <select value={assigned}
                        onChange={(e) => { setAssigned(e.target.value); apply({ assigned: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">All agents</option>
                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>

                    <Link href="/leads/import"
                        className="px-3 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition whitespace-nowrap flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                        Import CSV
                    </Link>
                    <Link href="/leads/create"
                        className="ml-auto px-4 py-2.5 text-sm rounded-xl text-white font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-sm transition hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add lead
                    </Link>
                </div>

                {/* Table */}
                {leads.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {['Ref', 'Contact', 'Source', 'Purpose', 'Budget', 'Status', 'Assigned', 'Date', ''].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leads.data.map((l) => {
                                        const contactName = l.contact
                                            ? `${l.contact.first_name} ${l.contact.last_name}`.trim()
                                            : null;
                                        return (
                                            <tr key={l.id} className="hover:bg-gray-50/70 transition-colors group">
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <Link href={`/leads/${l.id}`}
                                                        className="font-mono text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                                                        {l.reference}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {contactName ? (
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar name={contactName} />
                                                            <div>
                                                                <Link href={`/contacts/${l.contact.id}`}
                                                                    className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-sm">
                                                                    {contactName}
                                                                </Link>
                                                                {l.contact.phone && (
                                                                    <div className="text-xs text-gray-400 mt-0.5">{l.contact.phone}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs italic">No contact</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-gray-500">
                                                    {l.source ? `${l.source.icon ? l.source.icon + ' ' : ''}${l.source.name}` : '—'}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ring-1 ${
                                                        l.purpose === 'buy'
                                                            ? 'bg-blue-50 text-blue-700 ring-blue-200'
                                                            : 'bg-purple-50 text-purple-700 ring-purple-200'
                                                    }`}>{l.purpose}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap font-medium">
                                                    {l.budget_max ? `RWF ${Number(l.budget_max).toLocaleString()}` : '—'}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ring-1 ${STATUS_STYLES[l.status]}`}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-gray-500">
                                                    {l.assigned_to?.name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{l.created_at}</td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <Link href={`/leads/${l.id}/edit`}
                                                        className="text-xs text-gray-400 hover:text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-all">
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                            <span className="text-xs text-gray-400">Showing {leads.from}–{leads.to} of {leads.total} leads</span>
                            <div className="flex gap-2">
                                {leads.prev_page_url && (
                                    <Link href={leads.prev_page_url}
                                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs text-gray-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                                        Prev
                                    </Link>
                                )}
                                {leads.next_page_url && (
                                    <Link href={leads.next_page_url}
                                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs text-gray-600 flex items-center gap-1">
                                        Next
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No leads found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            <Link href="/leads/create" className="text-emerald-600 hover:text-emerald-700 font-medium">Add your first lead</Link>
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
