import { Link } from '@inertiajs/react';
import SuperAdminLayout, { SUB_STATUS_BADGE } from '@/Layouts/SuperAdminLayout';

const BADGE_COLOR = {
    emerald: 'bg-emerald-100 text-emerald-700',
    violet:  'bg-violet-100 text-violet-700',
    amber:   'bg-amber-100 text-amber-700',
    sky:     'bg-sky-100 text-sky-700',
    red:     'bg-red-100 text-red-700',
    gray:    'bg-gray-100 text-gray-600',
};

function StatCard({ label, value, sub, color, icon }) {
    const colors = {
        violet: { bg: 'bg-violet-50', ring: 'ring-violet-200', icon: 'bg-violet-100 text-violet-600', val: 'text-violet-900' },
        emerald:{ bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-900' },
        amber:  { bg: 'bg-amber-50', ring: 'ring-amber-200', icon: 'bg-amber-100 text-amber-600', val: 'text-amber-900' },
        sky:    { bg: 'bg-sky-50', ring: 'ring-sky-200', icon: 'bg-sky-100 text-sky-600', val: 'text-sky-900' },
    };
    const c = colors[color] ?? colors.violet;
    return (
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 ring-1 ${c.ring}`}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.icon}`}>{icon}</div>
            </div>
            <p className={`text-3xl font-bold ${c.val}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function SuperAdminDashboard({ stats, recent_companies, subs_by_status }) {
    const totalSubs = Object.values(subs_by_status).reduce((a, b) => a + b, 0);

    return (
        <SuperAdminLayout title="Super Admin Dashboard">
            <div className="max-w-6xl space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Companies"
                        value={stats.total_companies}
                        sub={`${stats.active_companies} active`}
                        color="violet"
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>}
                    />
                    <StatCard
                        label="Active Subscriptions"
                        value={stats.active_subs}
                        sub={`${totalSubs} total`}
                        color="emerald"
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 010 2.624 3.745 3.745 0 01-2.625 2.625 3.744 3.744 0 01-2.624 0 3.745 3.745 0 01-3.068-1.593 3.744 3.744 0 01-2.624 0 3.745 3.745 0 01-2.625-2.625 3.744 3.744 0 010-2.624A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 010-2.624 3.745 3.745 0 012.625-2.625 3.744 3.744 0 012.624 0A3.744 3.744 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.744 3.744 0 012.624 0 3.745 3.745 0 012.625 2.625 3.744 3.744 0 010 2.624A3.745 3.745 0 0121 12z" /></svg>}
                    />
                    <StatCard
                        label="Total Users"
                        value={stats.total_users}
                        sub="across all companies"
                        color="sky"
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0Zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0Z" /></svg>}
                    />
                    <StatCard
                        label="Est. Monthly Revenue"
                        value={`RWF ${Number(stats.mrr).toLocaleString()}`}
                        sub="MRR (active plans)"
                        color="amber"
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" /></svg>}
                    />
                </div>

                {/* Sub status breakdown */}
                {totalSubs > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Subscriptions by Status</h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(subs_by_status).map(([status, count]) => (
                                <div key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${SUB_STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                                    <span className="capitalize">{status.replace('_', ' ')}</span>
                                    <span className="font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent companies */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Recent Companies</h3>
                        <Link href="/superadmin/companies"
                            className="text-xs font-medium text-violet-600 hover:text-violet-800">
                            View all →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recent_companies.map(c => (
                            <Link key={c.id} href={`/superadmin/companies/${c.id}`}
                                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-bold shrink-0">
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                                    <p className="text-xs text-gray-400">{c.created_at}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {c.plan && (
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_COLOR[c.plan.badge_color] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {c.plan.name}
                                        </span>
                                    )}
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SUB_STATUS_BADGE[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                        {c.status.replace('_', ' ')}
                                    </span>
                                    {!c.is_active && (
                                        <span className="text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-medium">Suspended</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/superadmin/companies/create"
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-violet-300 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 group-hover:bg-violet-500 flex items-center justify-center text-violet-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Add Company</p>
                            <p className="text-xs text-gray-400">Create a new tenant account</p>
                        </div>
                    </Link>
                    <Link href="/superadmin/plans"
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-violet-300 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-500 flex items-center justify-center text-emerald-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Manage Plans</p>
                            <p className="text-xs text-gray-400">Edit pricing & feature limits</p>
                        </div>
                    </Link>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
