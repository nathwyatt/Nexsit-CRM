import { Link, router, useForm } from '@inertiajs/react';
import SuperAdminLayout, { SUB_STATUS_BADGE } from '@/Layouts/SuperAdminLayout';

const BADGE_COLOR = {
    emerald: 'bg-emerald-100 text-emerald-700',
    violet:  'bg-violet-100 text-violet-700',
    amber:   'bg-amber-100 text-amber-700',
    sky:     'bg-sky-100 text-sky-700',
    red:     'bg-red-100 text-red-700',
};

function FilterBar({ filters }) {
    const { data, setData } = useForm({
        search: filters.search ?? '',
        status: filters.status ?? '',
    });

    function apply(field, val) {
        const next = { ...data, [field]: val };
        setData(field, val);
        router.get('/superadmin/companies', next, { preserveState: true, replace: true });
    }

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search companies…"
                    value={data.search}
                    onChange={e => apply('search', e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white w-48"
                />
            </div>
            <select
                value={data.status}
                onChange={e => apply('status', e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
            </select>
        </div>
    );
}

export default function CompaniesIndex({ companies, filters }) {
    return (
        <SuperAdminLayout title="Companies">
            <div className="max-w-6xl space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <FilterBar filters={filters} />
                    <Link href="/superadmin/companies/create"
                        className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition"
                        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add Company
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {companies.data.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-bold shrink-0">
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{c.name}</p>
                                                <p className="text-xs text-gray-400">{c.email ?? c.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {c.plan ? (
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLOR[c.plan.badge_color] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {c.plan.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">No plan</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${SUB_STATUS_BADGE[c.sub_status] ?? 'bg-gray-100 text-gray-500'}`}>
                                            {c.sub_status.replace('_', ' ')}
                                        </span>
                                        {!c.is_active && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-medium">Suspended</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-gray-500">
                                        <span>{c.users_count} users</span>
                                        <span className="mx-1 text-gray-300">·</span>
                                        <span>{c.properties_count} props</span>
                                        <span className="mx-1 text-gray-300">·</span>
                                        <span>{c.leads_count} leads</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-gray-500">
                                        {c.sub_ends_at ?? '—'}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Link href={`/superadmin/companies/${c.id}`}
                                            className="text-xs text-violet-600 hover:text-violet-800 font-medium">
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {companies.data.length === 0 && (
                        <div className="py-16 text-center text-gray-400">
                            <p className="text-sm">No companies found.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {companies.last_page > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-400">
                                Showing {companies.from}–{companies.to} of {companies.total}
                            </p>
                            <div className="flex gap-2">
                                {companies.prev_page_url && (
                                    <Link href={companies.prev_page_url}
                                        className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">
                                        ← Prev
                                    </Link>
                                )}
                                {companies.next_page_url && (
                                    <Link href={companies.next_page_url}
                                        className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100">
                                        Next →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
