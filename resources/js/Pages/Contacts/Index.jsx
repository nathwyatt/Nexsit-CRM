import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const ROLE_COLORS = {
    buyer:  'bg-blue-50 text-blue-700 ring-blue-200',
    tenant: 'bg-purple-50 text-purple-700 ring-purple-200',
    owner:  'bg-amber-50 text-amber-700 ring-amber-200',
};

const AVATAR_COLORS = [
    'from-violet-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-sky-400 to-blue-500',
    'from-pink-400 to-rose-500',
    'from-purple-400 to-fuchsia-500',
];

function Avatar({ name }) {
    const initials = name
        ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '?';
    const colorIdx = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
    return (
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} flex items-center justify-center shrink-0 font-semibold text-sm text-white shadow-sm`}>
            {initials}
        </div>
    );
}

export default function ContactsIndex({ contacts, agents, filters }) {
    const [search, setSearch]     = useState(filters.search ?? '');
    const [role, setRole]         = useState(filters.role ?? '');
    const [assigned, setAssigned] = useState(filters.assigned ?? '');

    function applyFilters(overrides = {}) {
        router.get('/contacts', { search, role, assigned, ...overrides }, {
            preserveState: true, replace: true,
        });
    }

    return (
        <AppLayout title="Contacts">
            <div className="space-y-5">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-48">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
                            placeholder="Search name, email, phone…"
                            className="w-full rounded-xl border border-gray-300 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                        />
                    </div>

                    <select value={role}
                        onChange={(e) => { setRole(e.target.value); applyFilters({ role: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">All roles</option>
                        <option value="buyer">Buyer</option>
                        <option value="tenant">Tenant</option>
                        <option value="owner">Owner</option>
                    </select>

                    <select value={assigned}
                        onChange={(e) => { setAssigned(e.target.value); applyFilters({ assigned: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">All agents</option>
                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>

                    <Link href="/contacts/import"
                        className="px-3 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition whitespace-nowrap flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                        Import CSV
                    </Link>
                    <Link href="/contacts/create"
                        className="ml-auto px-4 py-2.5 text-sm rounded-xl text-white font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-sm transition hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add contact
                    </Link>
                </div>

                {/* Table */}
                {contacts.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Roles</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nationality</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {contacts.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/70 transition-colors group">
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={c.name} />
                                                    <div>
                                                        <Link href={`/contacts/${c.id}`}
                                                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-sm">
                                                            {c.name}
                                                        </Link>
                                                        {c.tags?.length > 0 && (
                                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                                {c.tags.map((t) => (
                                                                    <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">{t}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {c.email && (
                                                    <div className="text-sm text-gray-600 truncate max-w-[180px]">{c.email}</div>
                                                )}
                                                {c.phone && (
                                                    <div className="text-xs text-gray-400 mt-0.5 font-mono">{c.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {c.roles.length > 0
                                                        ? c.roles.map((r) => (
                                                            <span key={r} className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ring-1 ${ROLE_COLORS[r]}`}>
                                                                {r}
                                                            </span>
                                                        ))
                                                        : <span className="text-xs text-gray-300">—</span>
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-500">{c.nationality ?? '—'}</td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex gap-3 text-xs text-gray-400">
                                                    {c.leads_count > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                                                            {c.leads_count} lead{c.leads_count !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                    {c.deals_count > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                                                            {c.deals_count} deal{c.deals_count !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                    {c.leads_count === 0 && c.deals_count === 0 && <span className="text-gray-200">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link href={`/contacts/${c.id}/edit`}
                                                    className="text-xs text-gray-400 hover:text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-all">
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs text-gray-400">Showing {contacts.from}–{contacts.to} of {contacts.total} contacts</span>
                            <div className="flex gap-2">
                                {contacts.prev_page_url && (
                                    <Link href={contacts.prev_page_url}
                                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs text-gray-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                                        Prev
                                    </Link>
                                )}
                                {contacts.next_page_url && (
                                    <Link href={contacts.next_page_url}
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
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No contacts found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            <Link href="/contacts/create" className="text-emerald-600 hover:text-emerald-700 font-medium">Add your first contact</Link>
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
