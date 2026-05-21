import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_CONFIG = {
    scheduled:  { label: 'Scheduled',  bg: 'bg-blue-50 text-blue-700 ring-blue-200'      },
    confirmed:  { label: 'Confirmed',  bg: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    completed:  { label: 'Completed',  bg: 'bg-gray-100 text-gray-600 ring-gray-200'     },
    cancelled:  { label: 'Cancelled',  bg: 'bg-red-50 text-red-700 ring-red-200'         },
    no_show:    { label: 'No Show',    bg: 'bg-amber-50 text-amber-700 ring-amber-200'   },
};

function StatusBadge({ status }) {
    const c = STATUS_CONFIG[status] ?? { label: status, bg: 'bg-gray-100 text-gray-600 ring-gray-200' };
    return (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ring-1 ${c.bg}`}>
            {c.label}
        </span>
    );
}

export default function ViewingsIndex({ viewings, summary, agents, properties, filters }) {
    const [status, setStatus]       = useState(filters.status ?? '');
    const [property, setProperty]   = useState(filters.property ?? '');
    const [agent, setAgent]         = useState(filters.agent ?? '');
    const [from, setFrom]           = useState(filters.from ?? '');
    const [to, setTo]               = useState(filters.to ?? '');

    function apply(overrides = {}) {
        router.get('/viewings', { status, property, agent, from, to, ...overrides }, {
            preserveState: true, replace: true,
        });
    }

    const total = Object.values(summary).reduce((a, b) => a + b, 0);

    return (
        <AppLayout title="Property Viewings">
            <div className="space-y-5">

                {/* Summary pills */}
                <div className="flex flex-wrap gap-3">
                    {[
                        { key: '',           label: 'All',       count: total,                    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200'            },
                        { key: 'scheduled',  label: 'Scheduled', count: summary.scheduled ?? 0,  color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'             },
                        { key: 'confirmed',  label: 'Confirmed', count: summary.confirmed ?? 0,  color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'    },
                        { key: 'completed',  label: 'Completed', count: summary.completed ?? 0,  color: 'bg-gray-100 text-gray-600 hover:bg-gray-200'            },
                        { key: 'no_show',    label: 'No Show',   count: summary.no_show ?? 0,    color: 'bg-amber-50 text-amber-700 hover:bg-amber-100'          },
                        { key: 'cancelled',  label: 'Cancelled', count: summary.cancelled ?? 0,  color: 'bg-red-50 text-red-700 hover:bg-red-100'               },
                    ].map(({ key, label, count, color }) => (
                        <button key={key}
                            onClick={() => { setStatus(key); apply({ status: key }); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${color} ${status === key ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
                            {label}
                            <span className="text-xs opacity-70">{count}</span>
                        </button>
                    ))}

                    <Link href="/viewings/create"
                        className="ml-auto px-4 py-2 text-sm rounded-xl text-white font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-sm hover:opacity-90 transition"
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Book Viewing
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select value={property}
                        onChange={(e) => { setProperty(e.target.value); apply({ property: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-40">
                        <option value="">All properties</option>
                        {properties.map((p) => <option key={p.id} value={p.id}>{p.reference} — {p.title}</option>)}
                    </select>

                    <select value={agent}
                        onChange={(e) => { setAgent(e.target.value); apply({ agent: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">All agents</option>
                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>

                    <input type="date" value={from}
                        onChange={(e) => { setFrom(e.target.value); apply({ from: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="From date" />

                    <input type="date" value={to}
                        onChange={(e) => { setTo(e.target.value); apply({ to: e.target.value }); }}
                        className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="To date" />
                </div>

                {/* Table */}
                {viewings.data.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        {['Date & Time', 'Property', 'Client', 'Agent', 'Duration', 'Status', ''].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {viewings.data.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50/70 transition-colors group">
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900">{v.scheduled_at}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {v.property ? (
                                                    <div>
                                                        <Link href={`/properties/${v.property.id}`}
                                                            className="font-medium text-gray-900 hover:text-emerald-600 transition-colors text-sm">
                                                            {v.property.title}
                                                        </Link>
                                                        <div className="text-xs text-gray-400 font-mono mt-0.5">{v.property.reference}</div>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {v.contact ? (
                                                    <div>
                                                        <Link href={`/contacts/${v.contact.id}`}
                                                            className="font-medium text-gray-700 hover:text-indigo-600 transition-colors text-sm">
                                                            {v.contact.name}
                                                        </Link>
                                                        {v.contact.phone && (
                                                            <div className="text-xs text-gray-400 font-mono mt-0.5">{v.contact.phone}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    v.lead ? (
                                                        <Link href={`/leads/${v.lead.id}`} className="text-xs text-indigo-500 font-mono">
                                                            {v.lead.reference}
                                                        </Link>
                                                    ) : <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-500">{v.assigned_to?.name ?? '—'}</td>
                                            <td className="px-4 py-3.5 text-xs text-gray-400">{v.duration_minutes} min</td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={v.status} />
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link href={`/viewings/${v.id}`}
                                                    className="text-xs text-gray-400 hover:text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-all">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs text-gray-400">Showing {viewings.from}–{viewings.to} of {viewings.total} viewings</span>
                            <div className="flex gap-2">
                                {viewings.prev_page_url && (
                                    <Link href={viewings.prev_page_url}
                                        className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs text-gray-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                                        Prev
                                    </Link>
                                )}
                                {viewings.next_page_url && (
                                    <Link href={viewings.next_page_url}
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
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No viewings found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            <Link href="/viewings/create" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                Book the first viewing
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
