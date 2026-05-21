import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

function DateFilter({ filters, path }) {
    const [from, setFrom] = useState(filters.from);
    const [to,   setTo]   = useState(filters.to);
    function apply(e) {
        e.preventDefault();
        router.get(path, { from, to }, { preserveState: true });
    }
    return (
        <form onSubmit={apply} className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-gray-500 font-medium">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <label className="text-xs text-gray-500 font-medium">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                Apply
            </button>
        </form>
    );
}

function SummaryCard({ label, value, sub, color = 'gray' }) {
    const map = {
        indigo: 'text-indigo-700 bg-indigo-50', green: 'text-green-700 bg-green-50',
        amber:  'text-amber-700 bg-amber-50',   gray:  'text-gray-700 bg-gray-50',
        purple: 'text-purple-700 bg-purple-50',
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 inline-block px-2 py-0.5 rounded-lg ${map[color]}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

function fmtRwf(n) { return `RWF ${Number(n ?? 0).toLocaleString()}`; }

export default function ReportsDeals({ byStatus = {}, byPipeline = [], wonOverTime = [], summary = {}, filters }) {
    const statusPie = Object.entries(byStatus).map(([name, d]) => ({ name, value: d.count }));

    return (
        <AppLayout title="Deals Report">
            <div className="max-w-7xl space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <span>Reports</span><span>/</span>
                            <span className="text-gray-700 font-medium">Deals</span>
                        </nav>
                        <h1 className="text-xl font-bold text-gray-900">Deals Report</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/reports/leads"   className="text-xs text-gray-500 hover:text-indigo-600">Leads →</Link>
                        <Link href="/reports/revenue" className="text-xs text-gray-500 hover:text-indigo-600">Revenue →</Link>
                    </div>
                </div>

                <DateFilter filters={filters} path="/reports/deals" />

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <SummaryCard label="Total Deals"  value={summary.total ?? 0}    color="indigo" />
                    <SummaryCard label="Won"          value={summary.won ?? 0}       color="green" />
                    <SummaryCard label="Won Value"    value={fmtRwf(summary.wonValue)} color="green"
                        sub="closed deals" />
                    <SummaryCard label="Avg Deal Size" value={fmtRwf(summary.avgValue)} color="amber" />
                    <SummaryCard label="Win Rate"     value={`${summary.winRate ?? 0}%`} color="purple"
                        sub={`${summary.won ?? 0} of ${summary.total ?? 0}`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Won deals over time */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Won Deals Over Time</h2>
                        {wonOverTime.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={wonOverTime} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v, n) => [n === 'value' ? fmtRwf(v) : v, n === 'value' ? 'Value' : 'Deals']} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="count" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center text-gray-300 text-sm">No data</div>
                        )}
                    </div>

                    {/* By status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">By Status</h2>
                        {statusPie.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                        paddingAngle={2} dataKey="value">
                                        {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center text-gray-300 text-sm">No data</div>
                        )}
                    </div>

                    {/* By pipeline */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Open Deals by Pipeline</h2>
                        {byPipeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={byPipeline} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }}
                                        tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                                    <Tooltip formatter={(v, n) => [n === 'value' ? fmtRwf(v) : v, n === 'value' ? 'Pipeline value' : 'Count']} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar yAxisId="left"  dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="count" />
                                    <Bar yAxisId="right" dataKey="value" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="value" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">No open deals</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
