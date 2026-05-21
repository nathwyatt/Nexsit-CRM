import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

function DateFilter({ filters }) {
    const [from, setFrom] = useState(filters.from);
    const [to,   setTo]   = useState(filters.to);
    function apply(e) {
        e.preventDefault();
        router.get('/reports/revenue', { from, to }, { preserveState: true });
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
        indigo: 'text-indigo-700 bg-indigo-50', green:  'text-green-700 bg-green-50',
        red:    'text-red-700 bg-red-50',        amber:  'text-amber-700 bg-amber-50',
        gray:   'text-gray-700 bg-gray-50',      purple: 'text-purple-700 bg-purple-50',
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

export default function ReportsRevenue({ monthly = [], byMethod = {}, summary = {}, filters }) {
    const methodPie = Object.entries(byMethod).map(([name, d]) => ({ name, value: d.count }));

    return (
        <AppLayout title="Revenue Report">
            <div className="max-w-7xl space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                            <span>Reports</span><span>/</span>
                            <span className="text-gray-700 font-medium">Revenue</span>
                        </nav>
                        <h1 className="text-xl font-bold text-gray-900">Revenue Report</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Tenancy payment collections</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/reports/leads" className="text-xs text-gray-500 hover:text-indigo-600">Leads →</Link>
                        <Link href="/reports/deals" className="text-xs text-gray-500 hover:text-indigo-600">Deals →</Link>
                    </div>
                </div>

                <DateFilter filters={filters} />

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <SummaryCard label="Expected"       value={fmtRwf(summary.totalExpected)}  color="indigo" />
                    <SummaryCard label="Collected"      value={fmtRwf(summary.totalCollected)} color="green" />
                    <SummaryCard label="Outstanding"
                        value={fmtRwf((summary.totalExpected ?? 0) - (summary.totalCollected ?? 0))}
                        color="amber" />
                    <SummaryCard label="Overdue"        value={fmtRwf(summary.totalOverdue)}
                        sub={`${summary.overdueCount ?? 0} payments`} color="red" />
                    <SummaryCard label="Collection Rate" value={`${summary.collectionRate ?? 0}%`} color="purple" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Monthly bar chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">Expected vs Collected</h2>
                        {monthly.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={monthly} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => {
                                        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                                        if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
                                        return String(v);
                                    }} />
                                    <Tooltip formatter={v => fmtRwf(v)} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Bar dataKey="expected"  fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Expected" />
                                    <Bar dataKey="collected" fill="#6366f1" radius={[4, 4, 0, 0]} name="Collected" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] flex items-center justify-center text-gray-300 text-sm">No payment data</div>
                        )}
                    </div>

                    {/* By payment method */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">By Payment Method</h2>
                        {methodPie.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={methodPie} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                                        paddingAngle={2} dataKey="value">
                                        {methodPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[260px] flex items-center justify-center text-gray-300 text-sm">No payments yet</div>
                        )}
                    </div>
                </div>

                {/* Collection rate progress */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Collection Progress</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                                className="h-4 rounded-full bg-indigo-600 transition-all"
                                style={{ width: `${Math.min(summary.collectionRate ?? 0, 100)}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-indigo-700 shrink-0">
                            {summary.collectionRate ?? 0}%
                        </span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>Collected: {fmtRwf(summary.totalCollected)}</span>
                        <span>Expected: {fmtRwf(summary.totalExpected)}</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
