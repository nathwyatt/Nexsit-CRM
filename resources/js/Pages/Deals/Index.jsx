import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import KanbanBoard from '@/Components/Pipeline/KanbanBoard';

const STATUS = {
    open:    { badge: 'bg-indigo-100 text-indigo-700',  label: 'Open' },
    won:     { badge: 'bg-green-100 text-green-700',    label: 'Won' },
    lost:    { badge: 'bg-red-100 text-red-700',        label: 'Lost' },
    on_hold: { badge: 'bg-amber-100 text-amber-700',    label: 'On Hold' },
};

const TYPE = {
    sale:   { badge: 'bg-blue-100 text-blue-700',     label: 'Sale' },
    rental: { badge: 'bg-purple-100 text-purple-700', label: 'Rental' },
};

function ListFilters({ filters, pipelines, agents }) {
    function set(key, val) {
        router.get('/deals', { ...filters, view: 'list', [key]: val || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <input
                type="text"
                placeholder="Search deals…"
                defaultValue={filters.search}
                onKeyDown={e => e.key === 'Enter' && set('search', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select value={filters.status ?? ''} onChange={e => set('status', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="on_hold">On Hold</option>
            </select>
            <select value={filters.type ?? ''} onChange={e => set('type', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All types</option>
                <option value="sale">Sale</option>
                <option value="rental">Rental</option>
            </select>
            <select value={filters.pipeline ?? ''} onChange={e => set('pipeline', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All pipelines</option>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filters.assigned ?? ''} onChange={e => set('assigned', e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All agents</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
        </div>
    );
}

export default function DealsIndex({ view, deals, pipelines, agents, filters, pipeline, columns }) {
    function switchView(v) {
        router.get('/deals', { view: v, pipeline: filters.pipeline }, { preserveState: false });
    }

    function switchPipeline(id) {
        router.get('/deals', { view: 'kanban', pipeline: id }, { preserveState: false });
    }

    return (
        <AppLayout title="Deals">
            <div className="flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900">Deals</h1>
                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                            <button
                                onClick={() => switchView('list')}
                                className={`px-3 py-1.5 ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => switchView('kanban')}
                                className={`px-3 py-1.5 border-l border-gray-300 ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                Kanban
                            </button>
                        </div>
                        <Link href="/deals/create"
                            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                            + New deal
                        </Link>
                    </div>
                </div>

                {view === 'kanban' ? (
                    <>
                        {pipelines.length > 0 && (
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {pipelines.map(p => (
                                    <button key={p.id} onClick={() => switchPipeline(p.id)}
                                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                            pipeline?.id === p.id
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                                        }`}>
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {columns && columns.length > 0 ? (
                            <KanbanBoard columns={columns} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                                {pipelines.length === 0
                                    ? 'No active pipelines. Create one in Settings → Pipelines.'
                                    : 'Select a pipeline above to view the board.'}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <ListFilters filters={filters} pipelines={pipelines} agents={agents} />

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="px-4 py-3 text-left font-medium">Deal</th>
                                        <th className="px-4 py-3 text-left font-medium">Contact</th>
                                        <th className="px-4 py-3 text-left font-medium">Stage</th>
                                        <th className="px-4 py-3 text-left font-medium">Value</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Assigned</th>
                                        <th className="px-4 py-3 text-left font-medium">Close date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {deals.data.map(deal => {
                                        const ss = STATUS[deal.status] ?? STATUS.open;
                                        const ts = TYPE[deal.type]     ?? TYPE.sale;
                                        return (
                                            <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <Link href={`/deals/${deal.id}`}
                                                        className="font-medium text-gray-900 hover:text-indigo-600 block">
                                                        {deal.title}
                                                    </Link>
                                                    <p className="text-xs font-mono text-gray-400">{deal.reference}</p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{deal.contact?.name ?? '—'}</td>
                                                <td className="px-4 py-3">
                                                    {deal.stage ? (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: deal.stage.color }} />
                                                            {deal.stage.name}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {deal.value ? `${deal.currency} ${Number(deal.value).toLocaleString()}` : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ss.badge}`}>{ss.label}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ts.badge}`}>{ts.label}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{deal.assigned_to?.name ?? '—'}</td>
                                                <td className="px-4 py-3 text-gray-500">{deal.expected_close_date ?? '—'}</td>
                                            </tr>
                                        );
                                    })}
                                    {deals.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                                                No deals found.{' '}
                                                <Link href="/deals/create" className="text-indigo-600 hover:underline">Create one</Link>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {deals.last_page > 1 && (
                            <div className="flex justify-center gap-1 mt-4">
                                {deals.links.map((link, i) => (
                                    <Link key={i} href={link.url ?? '#'}
                                        className={`px-3 py-1.5 text-sm rounded-lg ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                    ? 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'
                                                    : 'bg-white border border-gray-200 text-gray-300 cursor-default'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
