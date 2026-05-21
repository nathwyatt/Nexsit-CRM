import { useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseYM(ym) {
    const [y, m] = ym.split('-').map(Number);
    return { year: y, month: m }; // month is 1-based
}

function offsetMonth(ym, delta) {
    let { year, month } = parseYM(ym);
    month += delta;
    if (month > 12) { month -= 12; year++; }
    if (month < 1)  { month += 12; year--; }
    return `${year}-${String(month).padStart(2, '0')}`;
}

function buildGrid(ym) {
    const { year, month } = parseYM(ym);
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];

    // Leading blanks
    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push(date);
    }

    // Trailing blanks to fill last row
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
}

function monthLabel(ym) {
    const { year, month } = parseYM(ym);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

// ─── Event chip ─────────────────────────────────────────────────────────────

const TYPE_STYLES = {
    task: {
        high:   'bg-red-100 text-red-700',
        urgent: 'bg-red-200 text-red-800',
        medium: 'bg-amber-100 text-amber-700',
        normal: 'bg-amber-100 text-amber-700',
        low:    'bg-blue-100 text-blue-700',
    },
    payment:      'bg-orange-100 text-orange-700',
    tenancy_start:'bg-emerald-100 text-emerald-700',
    tenancy_end:  'bg-purple-100 text-purple-700',
    viewing:      'bg-sky-100 text-sky-700',
};

const TYPE_DOT = {
    task:          { high: 'bg-red-400', urgent: 'bg-red-500', medium: 'bg-amber-400', normal: 'bg-amber-400', low: 'bg-blue-400' },
    payment:       'bg-orange-400',
    tenancy_start: 'bg-emerald-500',
    tenancy_end:   'bg-purple-500',
    viewing:       'bg-sky-500',
};

function chipStyle(event) {
    if (event.overdue) return 'bg-red-200 text-red-800';
    if (event.type === 'task') return TYPE_STYLES.task[event.priority] ?? 'bg-gray-100 text-gray-700';
    if (event.type === 'viewing') return TYPE_STYLES.viewing;
    return TYPE_STYLES[event.type] ?? 'bg-gray-100 text-gray-600';
}

function dotColor(event) {
    if (event.overdue) return 'bg-red-500';
    if (event.type === 'task') return (TYPE_DOT.task[event.priority] ?? 'bg-amber-400');
    if (typeof TYPE_DOT[event.type] === 'string') return TYPE_DOT[event.type];
    return 'bg-gray-400';
}

// ─── Day cell ───────────────────────────────────────────────────────────────

function DayCell({ date, events, selected, onSelect }) {
    if (!date) return <div className="min-h-[90px] bg-gray-50/50 border-r border-b border-gray-100" />;

    const today    = date === todayStr();
    const dayNum   = parseInt(date.split('-')[2], 10);
    const visible  = events.slice(0, 3);
    const overflow = events.length - visible.length;

    return (
        <div
            onClick={() => onSelect(date)}
            className={`min-h-[90px] border-r border-b border-gray-100 p-1.5 cursor-pointer transition-colors
                ${selected === date ? 'bg-indigo-50' : 'hover:bg-gray-50'}
            `}
        >
            <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-semibold rounded-full mb-1
                ${today ? 'bg-indigo-600 text-white' : 'text-gray-600'}
            `}>
                {dayNum}
            </span>

            <div className="space-y-0.5">
                {visible.map(ev => (
                    <div key={ev.id}
                        className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium ${chipStyle(ev)}`}
                        title={ev.title}>
                        {ev.label || ev.title}
                    </div>
                ))}
                {overflow > 0 && (
                    <div className="text-[10px] text-gray-400 pl-1">+{overflow} more</div>
                )}
            </div>
        </div>
    );
}

// ─── Day detail sidebar ──────────────────────────────────────────────────────

function DayDetail({ date, events }) {
    if (!date) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
                <div className="text-center">
                    <p className="text-3xl mb-2">📅</p>
                    <p>Click a day to view events</p>
                </div>
            </div>
        );
    }

    const label = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const typeOrder = { payment: 0, tenancy_start: 1, tenancy_end: 2, task: 3 };
    const sorted    = [...events].sort((a, b) => (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9));

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200 bg-white sticky top-0">
                <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
                <p className="text-xs text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''}</p>
            </div>

            {events.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-300 text-sm">No events</div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {sorted.map(ev => (
                        <Link key={ev.id} href={ev.link}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <div className={`mt-0.5 shrink-0 w-2.5 h-2.5 rounded-full ${dotColor(ev)}`} />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 leading-snug">{ev.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                    {ev.type.replace('_', ' ')}
                                    {ev.priority && ` · ${ev.priority}`}
                                    {ev.overdue && <span className="text-red-500 font-medium"> · overdue</span>}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function Legend() {
    const items = [
        { color: 'bg-sky-500',     label: 'Viewing' },
        { color: 'bg-red-400',     label: 'Task — high/urgent' },
        { color: 'bg-amber-400',   label: 'Task — normal' },
        { color: 'bg-blue-400',    label: 'Task — low' },
        { color: 'bg-orange-400',  label: 'Payment due' },
        { color: 'bg-emerald-500', label: 'Tenancy starts' },
        { color: 'bg-purple-500',  label: 'Tenancy ends' },
    ];
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {items.map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                    {item.label}
                </span>
            ))}
        </div>
    );
}

// ─── Main page ───────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarIndex({ events, month }) {
    const [selected, setSelected] = useState(null);

    const grid = useMemo(() => buildGrid(month), [month]);

    // Group events by date
    const byDate = useMemo(() => {
        const map = {};
        for (const ev of events) {
            if (!map[ev.date]) map[ev.date] = [];
            map[ev.date].push(ev);
        }
        return map;
    }, [events]);

    function navigate(delta) {
        const next = offsetMonth(month, delta);
        router.get('/calendar', { month: next }, { preserveState: false });
    }

    function goToday() {
        router.get('/calendar', {}, { preserveState: false });
    }

    const selectedEvents = selected ? (byDate[selected] ?? []) : [];

    return (
        <AppLayout title="Calendar">
            <div className="max-w-7xl space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-900">{monthLabel(month)}</h1>
                        <div className="flex items-center gap-1">
                            <button onClick={() => navigate(-1)}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                                ‹
                            </button>
                            <button onClick={() => navigate(1)}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                                ›
                            </button>
                        </div>
                        <button onClick={goToday}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium">
                            Today
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''} this month</span>
                        <Link href="/viewings/create"
                            className="px-3 py-1.5 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 shadow-sm hover:opacity-90 transition"
                            style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Book Viewing
                        </Link>
                    </div>
                </div>

                <Legend />

                {/* Calendar + detail */}
                <div className="flex gap-4">
                    {/* Grid */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 border-b border-gray-200">
                            {DAYS.map(d => (
                                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Cells */}
                        <div className="grid grid-cols-7">
                            {grid.map((date, i) => (
                                <DayCell
                                    key={i}
                                    date={date}
                                    events={date ? (byDate[date] ?? []) : []}
                                    selected={selected}
                                    onSelect={setSelected}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Day detail panel */}
                    <div className="w-64 shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <DayDetail date={selected} events={selectedEvents} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
