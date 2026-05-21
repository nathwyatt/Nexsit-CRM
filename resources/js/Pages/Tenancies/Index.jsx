import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const STATUS_COLORS = {
    pending:    'bg-amber-100 text-amber-700',
    active:     'bg-green-100 text-green-700',
    expired:    'bg-gray-100 text-gray-600',
    terminated: 'bg-red-100 text-red-700',
};

const FREQ_LABELS = { monthly: '/mo', quarterly: '/qtr', yearly: '/yr' };

function TenancyRow({ t }) {
    const isExpiringSoon = t.status === 'active' &&
        new Date(t.end_date) <= new Date(Date.now() + 90 * 86400000);

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-3 px-4">
                <Link href={`/tenancies/${t.id}`}
                    className="font-mono text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    {t.reference}
                </Link>
            </td>
            <td className="py-3 px-4">
                {t.property ? (
                    <div>
                        <Link href={`/properties/${t.property.id}`}
                            className="text-sm font-medium text-gray-800 hover:text-indigo-600 line-clamp-1">
                            {t.property.title}
                        </Link>
                        {t.unit && <p className="text-xs text-gray-400">Unit {t.unit.unit_number}</p>}
                    </div>
                ) : <span className="text-gray-400 text-sm">—</span>}
            </td>
            <td className="py-3 px-4">
                {t.tenant ? (
                    <Link href={`/contacts/${t.tenant.id}`}
                        className="text-sm text-gray-700 hover:text-indigo-600">
                        {t.tenant.name}
                    </Link>
                ) : <span className="text-gray-400 text-sm">—</span>}
            </td>
            <td className="py-3 px-4 text-sm text-gray-700">
                {t.start_date} → {t.end_date}
                {isExpiringSoon && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                        Expiring soon
                    </span>
                )}
            </td>
            <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                AED {Number(t.rent_amount).toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-0.5">{FREQ_LABELS[t.rent_frequency]}</span>
            </td>
            <td className="py-3 px-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                </span>
            </td>
            <td className="py-3 px-4">
                <Link href={`/tenancies/${t.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    View →
                </Link>
            </td>
        </tr>
    );
}

function FilterBar({ filters, properties }) {
    const [local, setLocal] = useState({
        search:   filters.search ?? '',
        status:   filters.status ?? '',
        property: filters.property ?? '',
    });

    function apply(e) {
        e.preventDefault();
        const params = Object.fromEntries(Object.entries(local).filter(([, v]) => v !== ''));
        router.get('/tenancies', params, { preserveState: true });
    }

    const inputCls = 'rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <form onSubmit={apply} className="flex flex-wrap gap-3 items-center">
            <input value={local.search} onChange={e => setLocal(s => ({ ...s, search: e.target.value }))}
                placeholder="Search reference, tenant, property…"
                className={`${inputCls} min-w-56`} />
            <select value={local.status} onChange={e => setLocal(s => ({ ...s, status: e.target.value }))}
                className={inputCls}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
            </select>
            <select value={local.property} onChange={e => setLocal(s => ({ ...s, property: e.target.value }))}
                className={`${inputCls} max-w-xs`}>
                <option value="">All properties</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <button type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                Filter
            </button>
            <button type="button" onClick={() => router.get('/tenancies')}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:border-gray-400">
                Reset
            </button>
        </form>
    );
}

export default function TenanciesIndex({ tenancies, properties, filters }) {
    const { data, meta, links } = tenancies;

    return (
        <AppLayout title="Tenancies">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Tenancies</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} total</p>
                    </div>
                    <Link href="/tenancies/create"
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-semibold">
                        + New Tenancy
                    </Link>
                </div>

                <FilterBar filters={filters} properties={properties} />

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {data?.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Reference', 'Property', 'Tenant', 'Period', 'Rent', 'Status', ''].map(h => (
                                        <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(t => <TenancyRow key={t.id} t={t} />)}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 text-center">
                            <p className="text-3xl mb-3">📋</p>
                            <p className="text-gray-500 text-sm">No tenancies found.</p>
                            <Link href="/tenancies/create"
                                className="mt-3 inline-block text-indigo-600 text-sm font-medium hover:text-indigo-800">
                                Create first tenancy →
                            </Link>
                        </div>
                    )}
                </div>

                {links && (
                    <div className="flex justify-center gap-1 flex-wrap">
                        {links.map((link, i) => (
                            <button key={i}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : link.url
                                            ? 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'
                                            : 'bg-white border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
