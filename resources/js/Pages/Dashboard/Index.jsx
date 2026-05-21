import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

function fmt(n) {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
}

function fmtRwf(n) {
    return `RWF ${Number(n).toLocaleString()}`;
}

const KPI_CONFIG = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-100',  text: 'text-indigo-700',  ring: 'ring-indigo-200'  },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100',   text: 'text-amber-700',   ring: 'ring-amber-200'   },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    sky:     { bg: 'bg-sky-50',     icon: 'bg-sky-100',     text: 'text-sky-700',     ring: 'ring-sky-200'     },
    red:     { bg: 'bg-red-50',     icon: 'bg-red-100',     text: 'text-red-700',     ring: 'ring-red-200'     },
    purple:  { bg: 'bg-purple-50',  icon: 'bg-purple-100',  text: 'text-purple-700',  ring: 'ring-purple-200'  },
};

function KpiCard({ label, value, sub, color = 'indigo', href, icon }) {
    const c = KPI_CONFIG[color];
    const inner = (
        <div className={`relative rounded-2xl border border-white/60 p-5 shadow-sm hover:shadow-md transition-all overflow-hidden ${c.bg} ${href ? 'cursor-pointer hover:-translate-y-0.5 transform' : ''}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none">{label}</p>
                    <p className={`mt-3 text-3xl font-bold ${c.text}`}>{value}</p>
                    {sub && <p className="text-xs text-gray-500 mt-1.5 truncate">{sub}</p>}
                </div>
                {icon && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ring-1 ${c.icon} ${c.ring}`}>
                        <svg className={`w-5 h-5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            {icon}
                        </svg>
                    </div>
                )}
            </div>
            {href && (
                <div className={`absolute bottom-0 left-0 h-0.5 w-full opacity-30 ${c.text.replace('text-', 'bg-')}`} />
            )}
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionCard({ title, href, linkLabel = 'View all →', children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
                {href && (
                    <Link href={href} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                        {linkLabel}
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}

export default function Dashboard({
    kpis = {},
    leadsByStatus = {},
    leadsOverTime = [],
    dealsByPipeline = [],
    revenue = [],
    upcomingTasks = [],
    expiringTenancies = [],
    recentActivity = [],
}) {
    const pieData = Object.entries(leadsByStatus).map(([name, value]) => ({ name, value }));

    return (
        <AppLayout title="Dashboard">
            <div className="max-w-7xl space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                    <KpiCard label="New Leads" value={kpis.new_leads_month ?? 0} color="indigo" href="/reports/leads"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />}
                    />
                    <KpiCard label="Open Deals" value={kpis.open_deals ?? 0}
                        sub={kpis.open_deals_value ? fmtRwf(kpis.open_deals_value) : null}
                        color="amber" href="/reports/deals"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />}
                    />
                    <KpiCard label="Active Tenancies" value={kpis.active_tenancies ?? 0} color="emerald" href="/tenancies"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />}
                    />
                    <KpiCard label="Published Props" value={kpis.published_properties ?? 0} color="sky" href="/properties"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />}
                    />
                    <KpiCard label="Overdue Payments" value={kpis.overdue_payments ?? 0}
                        sub={kpis.overdue_amount ? fmtRwf(kpis.overdue_amount) : null}
                        color="red" href="/reports/revenue"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    />
                    <KpiCard label="Deals Won" value={kpis.won_deals_month ?? 0} color="purple" href="/reports/deals"
                        icon={<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />}
                    />
                </div>

                {/* Row 2: Leads over time + Leads by status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <SectionCard title="Leads & Deals — Last 6 Months" href="/reports/leads" className="lg:col-span-2">
                        <div className="lg:col-span-2">
                            {leadsOverTime.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={leadsOverTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} name="Leads" />
                                        <Line type="monotone" dataKey="deals" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} name="Deals" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[220px] flex flex-col items-center justify-center text-gray-300">
                                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>
                                    <p className="text-sm">No data yet</p>
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    <SectionCard title="Leads by Status" href="/reports/leads">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                        paddingAngle={3} dataKey="value">
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">No leads yet</div>
                        )}
                    </SectionCard>
                </div>

                {/* Row 3: Deals by pipeline + Revenue */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <SectionCard title="Open Deals by Pipeline" href="/reports/deals">
                        {dealsByPipeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={dealsByPipeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }}
                                        formatter={(v, n) => [n === 'value' ? fmtRwf(v) : v, n === 'value' ? 'Pipeline value' : 'Count']} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Deals" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">No open deals</div>
                        )}
                    </SectionCard>

                    <SectionCard title="Revenue — Last 6 Months" href="/reports/revenue">
                        {revenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={revenue} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `${fmt(v)}`} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 12 }}
                                        formatter={(v) => fmtRwf(v)} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="expected"  fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Expected" />
                                    <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]} name="Collected" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">No payment data yet</div>
                        )}
                    </SectionCard>
                </div>

                {/* Row 4: Upcoming tasks + Expiring tenancies + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Upcoming tasks */}
                    <SectionCard title="Tasks Due Soon" href="/tasks" linkLabel="All tasks →">
                        {upcomingTasks.length > 0 ? (
                            <ul className="divide-y divide-gray-50 -mx-1">
                                {upcomingTasks.map(t => (
                                    <li key={t.id} className="py-3 px-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{t.assigned}</p>
                                            </div>
                                            <span className={`text-xs shrink-0 font-semibold px-2 py-0.5 rounded-full ${
                                                t.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                t.priority === 'high'   ? 'bg-amber-100 text-amber-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>{t.priority}</span>
                                        </div>
                                        {t.due_at && (
                                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {t.due_at}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="py-8 text-center text-gray-300">
                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-xs">No tasks due in the next 7 days.</p>
                            </div>
                        )}
                    </SectionCard>

                    {/* Expiring tenancies */}
                    <SectionCard title="Tenancies Expiring Soon" href="/tenancies" linkLabel="All tenancies →">
                        {expiringTenancies.length > 0 ? (
                            <ul className="divide-y divide-gray-50 -mx-1">
                                {expiringTenancies.map(t => (
                                    <li key={t.id} className="py-3 px-1">
                                        <Link href={`/tenancies/${t.id}`} className="group block">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-mono text-indigo-600 group-hover:text-indigo-800 font-medium">{t.reference}</p>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                    t.days_left <= 30 ? 'bg-red-100 text-red-700' :
                                                    t.days_left <= 60 ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>{t.days_left}d left</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{t.property}</p>
                                            <p className="text-xs text-gray-400">{t.tenant}</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="py-8 text-center text-gray-300">
                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                                <p className="text-xs">No tenancies expiring soon.</p>
                            </div>
                        )}
                    </SectionCard>

                    {/* Recent activity */}
                    <SectionCard title="Recent Activity">
                        {recentActivity.length > 0 ? (
                            <ul className="divide-y divide-gray-50 -mx-1">
                                {recentActivity.map(a => (
                                    <li key={a.id} className="py-3 px-1 flex gap-3">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white">
                                                {a.user ? a.user.charAt(0).toUpperCase() : '?'}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-gray-700 leading-snug">{a.description}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {a.user && <span className="font-medium">{a.user} · </span>}
                                                {a.created_at}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="py-8 text-center text-gray-300">
                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-xs">No recent activity.</p>
                            </div>
                        )}
                    </SectionCard>
                </div>

            </div>
        </AppLayout>
    );
}
