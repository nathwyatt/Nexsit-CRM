import { router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];

function DateFilter({ filters }) {
    const [from, setFrom] = useState(filters.from);
    const [to,   setTo]   = useState(filters.to);

    function apply(e) {
        e.preventDefault();
        router.get('/reports/leads', { from, to }, { preserveState: true });
    }

    return (
        <form onSubmit={apply} className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-gray-500 font-medium">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <label className="text-xs text-gray-500 font-medium">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                Apply
            </button>
        </form>
    );
}

function SummaryCard({ label, value, sub, color = 'gray' }) {
    const map = {
        indigo:  'text-indigo-700 bg-indigo-50',
        green:   'text-green-700 bg-green-50',
        red:     'text-red-700 bg-red-50',
        amber:   'text-amber-700 bg-amber-50',
        gray:    'text-gray-700 bg-gray-50',
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 inline-block px-2 py-0.5 rounded-lg ${map[color]}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function ReportsLeads({ byStatus = {}, bySource = {}, overTime = [], summary = {}, filters }) {
    const statusData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
    const sourceData = Object.entries(bySource).map(([name, value]) => ({ name, value }));

    return (
        <AppLayout title="Leads Report">
            <div className="max-w-7xl space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <span>Reports</span><span>/</span>
                            <span className="text-gray-700 font-medium">Leads</span>
                        </nav>
                        <h1 className="text-xl font-bold text-gray-900">Leads Report</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/reports/deals" className="text-xs text-gray-500 hover:text-indigo-600">Deals →</Link>
                        <Link href="/reports/revenue" className="text-xs text-gray-500 hover:text-indigo-600">Revenue →</Link>
                    </div>
                </div>

                <DateFilter filters={filters} />

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <SummaryCard label="Total Leads"      value={summary.total ?? 0}      color="indigo" />
                    <SummaryCard label="Converted"        value={summary.converted ?? 0}  color="green" />
                    <SummaryCard label="Lost"             value={summary.lost ?? 0}        color="red" />
                    <SummaryCard label="Conversion Rate"  value={`${summary.convRate ?? 0}%`} color="amber"
                        sub={`${summary.converted ?? 0} of ${summary.total ?? 0} leads`} />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Over time */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Leads Over Time</h2>
                        {overTime.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={overTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Leads" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center text-gray-300 text-sm">No data</div>
                        )}
                    </div>

                    {/* By status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">By Status</h2>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                        paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}>
                                        {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center text-gray-300 text-sm">No data</div>
                        )}
                    </div>

                    {/* By source */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">By Source</h2>
                        {sourceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={sourceData} layout="vertical" margin={{ top: 4, right: 20, left: 60, bottom: 0 }}>
                                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Leads" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">No data</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
